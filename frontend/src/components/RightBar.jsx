import { Heart, Bookmark, Forward } from 'lucide-react';

const RightBar = () => {
  return (
    <div className="fixed top-1/2 right-4 -translate-y-1/2 flex flex-col gap-8 p-4 cursor-pointer">
      <Heart className='active:scale-50'/>
      <Bookmark className='active:scale-50'/>
      <Forward className='active:scale-50'/>
    </div>
  );
};

export default RightBar;
