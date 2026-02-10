import { House, CircleUserRound, ShoppingCart } from 'lucide-react';

const footer = () => {
    return (
        <div className='bg-[#27272a] flex text-white justify-around gap-20 absolute left-[20%] bottom-2 cursor-pointer'>
            <div><House className='active:scale-50'/></div>
            <div><ShoppingCart className='active:scale-50'/></div>
            <div><CircleUserRound className='active:scale-50'/></div>
        </div>
    )
}

export default footer