import React from 'react';

interface ImageGalleryProps {
  images?: string[];
  additionalCount?: number;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images = [], additionalCount = 0 }) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-md border">
    {images.slice(0, 4).map((image, index) => (
        <div key={index} className="relative cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition-opacity">
            <img
                src={image}
                alt="image"
                className="w-full h-24 object-cover"
            />
            {index === 3 && additionalCount && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-2xl font-semibold">
                    +{additionalCount}
                </div>
            )}
        </div>
    ))}
</div>
  );
};

export default ImageGallery;
