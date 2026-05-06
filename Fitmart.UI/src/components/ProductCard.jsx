
import * as React from "react"
import { cn } from "@/lib/utils"

export function ProductCard({
  images = [],
  title,
  description,
  price,
  className,
  ...props
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Logic trượt ảnh (hover slider)
    if (images.length > 1) {
      const segmentWidth = rect.width / images.length;
      const index = Math.min(
        images.length - 1,
        Math.max(0, Math.floor(x / segmentWidth))
      );
      setActiveIndex(index);
    }

    // 2. Logic 3D tilt theo tọa độ chuột
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotationX = (centerY - y) / 15; // Đảo ngược y cho xoay tự nhiên
    const rotationY = (x - centerX) / 15;
    
    setRotation({ x: rotationX, y: rotationY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveIndex(0);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Fallback nếu không có ảnh
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&q=80'];

  return (
    <a 
      href="#"
      className={cn("group flex flex-col no-underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[#000000]", className)}
      style={{ perspective: "1000px" }}
      {...props}
    >
      <div 
        ref={containerRef}
        className="w-full aspect-[3/4] bg-[#f5f5f5] overflow-hidden relative cursor-pointer rounded-[4px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        style={{
          transform: isHovered 
              ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
              : "rotateX(0deg) rotateY(0deg)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
          boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.4)" : "none",
          transformStyle: "preserve-3d",
        }}
      >
        <img
          src={displayImages[activeIndex]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        
        {/* Progress bar báo hiệu chuyển ảnh */}
        {isHovered && displayImages.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1 px-2 z-10">
            {displayImages.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-1 rounded-full transition-all duration-200", 
                  idx === activeIndex ? "bg-white w-4" : "bg-white/50 w-2"
                )} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col pt-[15px] space-y-[4px]">
        <h3 className="font-['Roboto',sans-serif] text-[16px] font-medium leading-[19px] text-[#000000]">
          {title}
        </h3>
        
        {description && (
          <p className="font-['Roboto',sans-serif] text-[14px] leading-[19px] text-[#6e6e6e] line-clamp-1">
            {description}
          </p>
        )}
        
        <p className="font-['Roboto',sans-serif] font-medium text-[16px] leading-[19px] text-[#000000] pt-[15px]">
          {price}
        </p>
      </div>
    </a>
  );
}