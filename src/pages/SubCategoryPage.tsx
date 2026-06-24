import { useParams } from "react-router-dom";
import { eventCategories } from "@/lib/categoryData";

const SubCategoryPage = () => {
        const { subcategoryName } = useParams();
        const services = [
        {
          title: "Beach Wedding",
          description: "Sun, sand and sea breeze.",
          icon: "🏝️",
        },
        {
          title: "Garden Wedding",
          description: "Nature and blooming flowers.",
          icon: "🌿",
        },
        {
          title: "Vintage Wedding",
          description: "Classic old-world charm.",
          icon: "🚗",
        },
        {
          title: "Royal Wedding",
          description: "Luxury and grandeur.",
          icon: "👑",
        },
        {
          title: "Bohemian Wedding",
          description: "Artistic and free-spirited.",
          icon: "✨",
        },
        {
          title: "Rustic Wedding",
          description: "Warm countryside vibes.",
          icon: "🏡",
        },
        {
          title: "Forest Wedding",
          description: "Magical greenery setting.",
          icon: "🌲",
        },
        {
          title: "Modern Minimalist",
          description: "Clean and elegant décor.",
          icon: "🏺",
        },
        {
          title: "Rooftop Wedding",
          description: "Stunning city views.",
          icon: "🏙️",
        },
      ];

  const subCategory = eventCategories
    .flatMap(category => category.subCategories)
    .find(
      sub =>
        sub.name === decodeURIComponent(subcategoryName || "")
    );

  if (!subCategory) {
    return <div className="p-10">Subcategory Not Found</div>;
  }

    const leftServices = services.slice(0, 5);
    const rightServices = services.slice(5);

  return (
    
  <div className="min-h-screen bg-background text-foreground p-10">
    <h1 className="text-5xl font-bold text-center mb-16">
      {subCategory.name}
    </h1>

    <div className="grid grid-cols-3 gap-8 items-center">
      
      {/* Left Side */}
      <div className="space-y-6">
        {leftServices.map((item) => (
          <div
            key={item.title}
            className="border rounded-2xl p-4 bg-card"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Center Circle */}
      <div className="flex justify-center">
        <div className="w-72 h-72 rounded-full border-4 border-gold flex items-center justify-center text-center">
          <h2 className="text-4xl font-bold">
            THEME-BASED
            <br />
            WEDDINGS
          </h2>
        </div>
      </div>

      {/* Right Side */}
      <div className="space-y-6">
        {rightServices.map((item) => (
          <div
            key={item.title}
            className="border rounded-2xl p-4 bg-card"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>

    </div>
  </div>
);
};

export default SubCategoryPage;