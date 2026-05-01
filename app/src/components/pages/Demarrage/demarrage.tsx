import {
    Button,
    IconButton,
    InputText,
    Modal,
    Card,
    Badge,
    Select,
    Loading,
    Alert,
    CardHeader,
    CardContent,
    CardFooter
} from '../..';


export default function Demarrage() {
    return (
        <div className='col col-auto w-full'>
            <div className='flex  justify-between'>
                
                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex '>
                        <div className='w-[4px] bg-amber-300 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl'>8</p>
                            <p>Total Projets</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex '>
                        <div className='w-[4px] bg-amber-300 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl'>8</p>
                            <p>Total Projets</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex '>
                        <div className='w-[4px] bg-amber-300 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl'>8</p>
                            <p>Total Projets</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card hover className='w-1/4 mx-1'>
                    <CardContent className='flex '>
                        <div className='w-[4px] bg-amber-300 rounded-full'></div>
                        <div className='px-4'>
                            <p className='text-3xl'>8</p>
                            <p>Total Projets</p>
                        </div>
                    </CardContent>
                </Card>
                
            </div>
            <div></div>
        </div>


    )
}