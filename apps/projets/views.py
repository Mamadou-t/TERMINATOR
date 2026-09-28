import uuid

from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Projet
from .serializers import ProjetSerializer

from apps.perimetre.models import Perimetre
from apps.charte.models import (
    Charte,
    LigneBudgetairePrevisionnelle,
    LigneCalendrierPrevisionnel,
)
from apps.wbs.models import WBS
from apps.activites.models import Activite
from apps.couts.models import Cout
from apps.ressources.models import Ressource
from apps.risques.models import Risque
from apps.livrables.models import Livrable
from apps.parties_prenantes.models import PartiePrenante, Impliquer, Particier
from apps.approvisionnement.models import Approvisionnement, Subir


def _clone(obj, **overrides):
    """Duplique une instance BaseModel en une nouvelle ligne (nouvel UUID)."""
    obj.pk = None
    obj.id = uuid.uuid4()
    obj._state.adding = True
    for champ, valeur in overrides.items():
        setattr(obj, champ, valeur)
    obj.save()
    return obj


def _code_projet_unique(base: str) -> str:
    """Genere un code_projet unique (contrainte d'unicite) a partir d'un code."""
    racine = (base or "PROJ")[:40]
    candidat = f"{racine}-COPIE"
    i = 1
    while Projet.objects.filter(code_projet=candidat).exists():
        i += 1
        candidat = f"{racine}-COPIE{i}"
    return candidat[:50]


@transaction.atomic
def dupliquer_projet(src: Projet) -> Projet:
    """
    Duplique un projet et TOUTES ses donnees liees (perimetre, charte + lignes,
    WBS, activites, couts, ressources, risques, livrables, parties prenantes et
    approvisionnements), en remappant les cles etrangeres et la matrice RACI.
    """
    # On fige les ids d'origine avant toute mutation.
    src_id = src.id
    src_charte_id = src.charte_id
    src_perimetre_id = src.perimetre_id
    src_wbs_racine_id = src.wbs_racine_id
    src_parent_id = src.projet_parent_id

    # --- Perimetre (1:1) ---
    new_perimetre = None
    if src_perimetre_id:
        new_perimetre = _clone(Perimetre.objects.get(pk=src_perimetre_id))

    # --- Charte (1:1) + lignes budgetaires (hierarchie) + calendrier ---
    new_charte = None
    if src_charte_id:
        new_charte = _clone(Charte.objects.get(pk=src_charte_id))
        lb_map = {}
        for lb in list(LigneBudgetairePrevisionnelle.objects.filter(charte_id=src_charte_id)):
            old_id, parent_old = lb.id, lb.tache_parent_id
            _clone(lb, charte=new_charte, tache_parent=None)
            lb_map[old_id] = (lb, parent_old)
        for old_id, (new_lb, parent_old) in lb_map.items():
            if parent_old and parent_old in lb_map:
                new_lb.tache_parent = lb_map[parent_old][0]
                new_lb.save(update_fields=["tache_parent"])
        for lc in list(LigneCalendrierPrevisionnel.objects.filter(charte_id=src_charte_id)):
            _clone(lc, charte=new_charte)

    # --- Projet (nouveau code, meme parent que l'original) ---
    new_projet = _clone(
        Projet.objects.get(pk=src_id),
        code_projet=_code_projet_unique(src.code_projet),
        nom_projet=f"{src.nom_projet} (copie)",
        charte=new_charte,
        perimetre=new_perimetre,
        wbs_racine=None,
        projet_parent_id=src_parent_id,
    )

    # --- WBS (projet FK + wbs_parent self) ---
    wbs_map = {}
    for w in list(WBS.objects.filter(projet_id=src_id)):
        old_id, parent_old = w.id, w.wbs_parent_id
        _clone(w, projet=new_projet, wbs_parent=None)
        wbs_map[old_id] = (w, parent_old)
    for old_id, (new_w, parent_old) in wbs_map.items():
        if parent_old and parent_old in wbs_map:
            new_w.wbs_parent = wbs_map[parent_old][0]
            new_w.save(update_fields=["wbs_parent"])
    if src_wbs_racine_id and src_wbs_racine_id in wbs_map:
        new_projet.wbs_racine = wbs_map[src_wbs_racine_id][0]
        new_projet.save(update_fields=["wbs_racine"])

    # --- Activites (wbs FK + activite_parent self) ---
    act_map = {}
    for a in list(Activite.objects.filter(wbs__projet_id=src_id)):
        old_id, parent_old, wbs_old = a.id, a.activite_parent_id, a.wbs_id
        _clone(a, wbs=wbs_map[wbs_old][0], activite_parent=None)
        act_map[old_id] = (a, parent_old)
    for old_id, (new_a, parent_old) in act_map.items():
        if parent_old and parent_old in act_map:
            new_a.activite_parent = act_map[parent_old][0]
            new_a.save(update_fields=["activite_parent"])

    # --- Couts / Ressources (activite FK) ---
    for c in list(Cout.objects.filter(activite__wbs__projet_id=src_id)):
        if c.activite_id in act_map:
            _clone(c, activite=act_map[c.activite_id][0])
    for r in list(Ressource.objects.filter(activite__wbs__projet_id=src_id)):
        if r.activite_id in act_map:
            _clone(r, activite=act_map[r.activite_id][0])

    # --- Risques (wbs FK) ---
    for rq in list(Risque.objects.filter(wbs__projet_id=src_id)):
        if rq.wbs_id in wbs_map:
            _clone(rq, wbs=wbs_map[rq.wbs_id][0])

    # --- Livrables (projet FK) : on garde la correspondance pour la RACI ---
    liv_map = {}
    for lv in list(Livrable.objects.filter(projet_id=src_id)):
        old_id = lv.id
        _clone(lv, projet=new_projet)
        liv_map[str(old_id)] = str(lv.id)

    # --- Approvisionnements + Subir (via activites) ---
    appro_map = {}
    for s in list(Subir.objects.filter(activite__wbs__projet_id=src_id)):
        if s.activite_id not in act_map:
            continue
        if s.approvisionnement_id not in appro_map:
            appro = Approvisionnement.objects.get(pk=s.approvisionnement_id)
            appro_map[s.approvisionnement_id] = _clone(appro)
        Subir.objects.create(
            activite=act_map[s.activite_id][0],
            approvisionnement=appro_map[s.approvisionnement_id],
        )

    # --- Parties prenantes (Impliquer) + Particier + RACI ---
    pp_map = {}
    for imp in list(Impliquer.objects.filter(projet_id=src_id)):
        if imp.partie_prenante_id not in pp_map:
            pp = PartiePrenante.objects.get(pk=imp.partie_prenante_id)
            raci = pp.raci if isinstance(pp.raci, dict) else {}
            new_raci = {liv_map[k]: v for k, v in raci.items() if k in liv_map}
            pp_map[imp.partie_prenante_id] = _clone(pp, raci=new_raci)
        Impliquer.objects.create(projet=new_projet, partie_prenante=pp_map[imp.partie_prenante_id])
    # Particier (partie prenante <-> activite), pour les parties prenantes clonees.
    for part in list(Particier.objects.filter(partie_prenante_id__in=list(pp_map.keys()))):
        if part.activite_id in act_map:
            Particier.objects.create(
                partie_prenante=pp_map[part.partie_prenante_id],
                activite=act_map[part.activite_id][0],
            )

    return new_projet


class ProjetViewSet(viewsets.ModelViewSet):
    # Tri stable pour une pagination deterministe (l'affichage arborescent est
    # re-trie cote client selon l'ordre manuel et le niveau).
    queryset = Projet.objects.all().order_by("ordre", "-cree_le")
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["projet_parent"]

    @action(detail=True, methods=["post"])
    def dupliquer(self, request, pk=None):
        """Duplique le projet et toutes ses donnees. Renvoie le nouveau projet."""
        nouveau = dupliquer_projet(self.get_object())
        return Response(ProjetSerializer(nouveau).data, status=status.HTTP_201_CREATED)
