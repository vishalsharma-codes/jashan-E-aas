import { useParams } from "react-router-dom";
import { eventCategories } from "@/lib/categoryData";
import { subCategorydata, pageColors } from "@/lib/weddingSubCategoryData";
import {corporateSubCategoryData, corporatePageColors} from "@/lib/corporateSubCategoryData";
import { educationalSubCategoryData, educationalPageColors } from "@/lib/educationalSubCategoryData";
import { concertSubCategoryData, concertPageColors } from "@/lib/concertSubCategoryData";
import { religiousSubCategoryData, religiousPageColors } from "@/lib/religiousSubCategoryData";
import { exhibitionsSubCategoryData, exhibitionsPageColors } from "@/lib/exhibitionsSubCategoryData";
import { sportsSubCategoryData, sportsPageColors } from "@/lib/sportsSubCategoryData";
import { governmentSubCategoryData, governmentPageColors } from "@/lib/govermentSubCategoryData";
import {  charitySubCategoryData, charityPageColors } from "@/lib/charitySubCategoryData";
import {  fashionLifestyleSubCategoryData, fashionLifestylePageColors } from "@/lib/fashionLifestyleSubCategoryData";
import {  virtualSubCategoryData, virtualPageColors } from "@/lib/virtualSubCategoryData";
import {  festivalsSubCategoryData, festivalsPageColors } from "@/lib/festivalsSubCategoryData";
import {  hospitalitySubCategoryData, hospitalityPageColors } from "@/lib/hospitalitySubCategoryData";
import {  filmMediaSubCategoryData, filmMediaPageColors } from "@/lib/filmMediaSubCategoryData";
import {  technologySubCategoryData, technologyPageColors } from "@/lib/technologySubCategoryData";
import {  healthWellnessSubCategoryData,healthWellnessPageColors } from "@/lib/healthWelnessSubCategory";
import {  communitySubCategoryData,communityPageColors } from "@/lib/CommunitySubCategoryData";
import { agriculturalSubCategoryData,agriculturalPageColors } from "@/lib/agriculturalSubCategoryData";
import {  automotiveSubCategoryData,automotivePageColors } from "@/lib/automotiveSubCategoryData";


const SubCategoryPage = () => {
  const { subcategoryName } = useParams();

  const subCategory = eventCategories
    .flatMap((category) => category.subCategories)
    .find(
      (sub) =>
        sub.name === decodeURIComponent(subcategoryName || "")
    );

  if (!subCategory) {
          return <div className="p-10">Subcategory Not Found</div>;
  }

// Check whether this is a Corporate Events subcategory
const isCorporate = Object.prototype.hasOwnProperty.call(
  corporateSubCategoryData,
  subCategory.name
);

const isEducational = Object.prototype.hasOwnProperty.call(
  educationalSubCategoryData,
  subCategory.name
);

const isConcert = Object.prototype.hasOwnProperty.call(
  concertSubCategoryData,
  subCategory.name
);

const isreligious = Object.prototype.hasOwnProperty.call(
  religiousSubCategoryData,
  subCategory.name
);

const isexhibition = Object.prototype.hasOwnProperty.call(
  exhibitionsSubCategoryData,
  subCategory.name
);

const isgovernment = Object.prototype.hasOwnProperty.call(
  governmentSubCategoryData,
  subCategory.name
);

const issport = Object.prototype.hasOwnProperty.call(
  sportsSubCategoryData,
  subCategory.name
);

const ischarity = Object.prototype.hasOwnProperty.call(
  charitySubCategoryData,
  subCategory.name
);

const isfashionLifestyle = Object.prototype.hasOwnProperty.call(
  fashionLifestyleSubCategoryData,
  subCategory.name
);

const isvirtual = Object.prototype.hasOwnProperty.call(
  virtualSubCategoryData,
  subCategory.name
);

const isfestivals = Object.prototype.hasOwnProperty.call(
  festivalsSubCategoryData,
  subCategory.name
);

const ishospitality = Object.prototype.hasOwnProperty.call(
  hospitalitySubCategoryData,
  subCategory.name
);

const isfilmMedia = Object.prototype.hasOwnProperty.call(
  filmMediaSubCategoryData,
  subCategory.name
);

const istechnology = Object.prototype.hasOwnProperty.call(
  technologySubCategoryData,
  subCategory.name
);

const iscommunity = Object.prototype.hasOwnProperty.call(
  communitySubCategoryData,
  subCategory.name
);

const ishealthWellness = Object.prototype.hasOwnProperty.call(
  healthWellnessSubCategoryData,
  subCategory.name
);

const isagricultural = Object.prototype.hasOwnProperty.call(
  agriculturalSubCategoryData,
  subCategory.name
);

const isautomotive = Object.prototype.hasOwnProperty.call(
  automotiveSubCategoryData,
  subCategory.name
);

// Get services according to category
const services = isCorporate
  ? corporateSubCategoryData[
      subCategory.name as keyof typeof corporateSubCategoryData
    ] || []

  : isEducational
  ? educationalSubCategoryData[
      subCategory.name as keyof typeof educationalSubCategoryData
    ] || []

  : isConcert
  ? concertSubCategoryData[
      subCategory.name as keyof typeof concertSubCategoryData
    ] || []

  : isreligious
  ? religiousSubCategoryData[
      subCategory.name as keyof typeof religiousSubCategoryData
  ] || []

  : isexhibition
  ? exhibitionsSubCategoryData[
      subCategory.name as keyof typeof exhibitionsSubCategoryData
  ] || []

  : issport
  ? sportsSubCategoryData[
      subCategory.name as keyof typeof sportsSubCategoryData
  ] || []

  : isgovernment
  ? governmentSubCategoryData[
      subCategory.name as keyof typeof governmentSubCategoryData
  ] || []

  : ischarity
  ? charitySubCategoryData[
      subCategory.name as keyof typeof charitySubCategoryData
  ] || []

  : isfashionLifestyle
  ? fashionLifestyleSubCategoryData[
      subCategory.name as keyof typeof fashionLifestyleSubCategoryData
  ] || []

  : isvirtual
  ? virtualSubCategoryData[
      subCategory.name as keyof typeof virtualSubCategoryData
  ] || []

  : isfestivals
  ? festivalsSubCategoryData[
      subCategory.name as keyof typeof festivalsSubCategoryData
  ] || []

  : ishospitality
  ? hospitalitySubCategoryData[
      subCategory.name as keyof typeof hospitalitySubCategoryData
  ] || []

  : isfilmMedia
  ? filmMediaSubCategoryData[
      subCategory.name as keyof typeof filmMediaSubCategoryData
  ] || []

  : istechnology
  ? technologySubCategoryData[
      subCategory.name as keyof typeof technologySubCategoryData
  ] || []

  : ishealthWellness
  ? healthWellnessSubCategoryData[
      subCategory.name as keyof typeof healthWellnessSubCategoryData
  ] || []

  : iscommunity
  ? communitySubCategoryData[
      subCategory.name as keyof typeof communitySubCategoryData
  ] || []

  : isagricultural
  ? agriculturalSubCategoryData[
      subCategory.name as keyof typeof agriculturalSubCategoryData
  ] || []

  : isautomotive
  ? automotiveSubCategoryData[
      subCategory.name as keyof typeof automotiveSubCategoryData
  ] || []

  : subCategorydata[
      subCategory.name as keyof typeof subCategorydata
    ] || [];

  

console.log("Services:", services);

// Get colors according to category
const colors = isCorporate
  ? corporatePageColors[
      subCategory.name as keyof typeof corporatePageColors
    ] || corporatePageColors["Corporate Events"]

  : isEducational
  ? educationalPageColors[
      subCategory.name as keyof typeof educationalPageColors
    ] || educationalPageColors["Educational Events"]

  : isConcert
  ? concertPageColors[
      subCategory.name as keyof typeof concertPageColors
    ] || concertPageColors["Concert Types"]

  : isreligious
  ? religiousPageColors[
      subCategory.name as keyof typeof religiousPageColors
    ] || religiousPageColors["Religious & Spiritual"]

  : isexhibition
  ? exhibitionsPageColors[
      subCategory.name as keyof typeof exhibitionsPageColors
    ] || exhibitionsPageColors["Exhibitions & Expos"]

  : issport
  ? sportsPageColors[
      subCategory.name as keyof typeof sportsPageColors
    ] || sportsPageColors["Sports Events"]

  : isgovernment
  ? governmentPageColors[
      subCategory.name as keyof typeof governmentPageColors
    ] || governmentPageColors["Government Events"]

  : ischarity
  ? charityPageColors[
      subCategory.name as keyof typeof charityPageColors
    ] || charityPageColors["Charity & NGO Events"]

  : isfashionLifestyle
  ? fashionLifestylePageColors[
      subCategory.name as keyof typeof fashionLifestylePageColors
    ] || fashionLifestylePageColors["Fashion & Lifestyle"]

  : isvirtual
  ? virtualPageColors[
      subCategory.name as keyof typeof virtualPageColors
    ] || virtualPageColors["Virtual & Hybrid Events"] 
    
  : isfestivals
  ? festivalsPageColors[
      subCategory.name as keyof typeof festivalsPageColors
    ] || festivalsPageColors["Festivals & Melas"]

  : ishospitality
  ? hospitalityPageColors[
      subCategory.name as keyof typeof hospitalityPageColors
    ] || hospitalityPageColors["Hospitality & F&B"]

  : isfilmMedia
  ? filmMediaPageColors[
      subCategory.name as keyof typeof filmMediaPageColors
    ] || filmMediaPageColors["Film & Media Events"]

  : istechnology
  ? technologyPageColors[
      subCategory.name as keyof typeof technologyPageColors
    ] || technologyPageColors["Tech & Innovation"] 
    
  : ishealthWellness
  ? healthWellnessPageColors[
      subCategory.name as keyof typeof healthWellnessPageColors
    ] ||healthWellnessPageColors["Health & Wellness"]   

  : iscommunity
  ? communityPageColors[
      subCategory.name as keyof typeof communityPageColors
    ] ||communityPageColors["Community Events"] 

  : isagricultural
  ? agriculturalPageColors[
      subCategory.name as keyof typeof agriculturalPageColors
    ] ||agriculturalPageColors["Agricultural & Rural Events"]

  : isautomotive
  ? automotivePageColors[
      subCategory.name as keyof typeof automotivePageColors
    ] ||automotivePageColors["Automotive Events"] 

  : pageColors[
      subCategory.name as keyof typeof pageColors
    ] || pageColors["Theme-Based Weddings"];

console.log("Colors:", colors);
 return(
<div
  className="relative min-h-screen text-[#4b3324] py-12 px-8 overflow-hidden"
  // style={{ backgroundColor: colors.background }}
>
  {/* Background Video */}
  {/* <div className="absolute inset-0 z-0 overflow-hidden">
    <video
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    >
      <source src={colors.backgroundVideo} type="video/mp4" />
    </video> */}

    {/* <div className="absolute inset-0 bg-black/35"></div>
  </div> */}

  {/* Page Content */}
  <div className="relative z-10">

  {/* <h1 className="text-5xl font-serif font-bold text-center mb-12">
    {subCategory.name}
  </h1> */}

  {/* TOP OVAL */}
  <div className="flex flex-col items-center">

        <div
          className="relative w-[460px] h-[240px] rounded-full border-[4px] bg-gradient-to-b from-[#fffdf8] to-[#f8f2e6] flex items-center justify-center shadow-lg"
          style={{ borderColor: colors.border }}
            >

            <div  
              className="absolute inset-4 rounded-full border"
              style={{ borderColor: colors.innerBorder }}
            ></div>
      {/* Left Decoration */}

          <div className="absolute left-12 bottom-12 text-4xl "
          style={{ color: colors.text }}>
            ❦
          </div>

          {/* Right Decoration */}

          <div className="absolute right-12 bottom-12 text-4xl rotate-180" 
          style={{ color: colors.text }} >
            ❦
          </div>

      <div className="text-center">

        <h2 className="text-4xl font-serif text-center leading-tight">
          {subCategory.name.toUpperCase()}
        </h2>

        <div
            className="text-2xl mt-4"
            style={{ color: colors.text }}
          >
          ❦ ─── ♡ ─── ❦
        </div>

      </div>

    </div>

{/* Vertical Line */}
<div
  className="w-[3px] h-16"
  style={{ backgroundColor: colors.line }}
></div>

{/* Horizontal Line */}
<div className="w-full flex justify-center">
  <div className="w-full max-w-[862px] h-[3px] "
    style={{ backgroundColor: colors.line }}></div>
</div>

</div>
  {/* CARDS */}

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mt-10 max-w-[1250px] mx-auto">

{services.map((item) => (
  <div
    key={item.title}
    className="relative flex justify-center"
  >
    {/* Vertical Connector */}
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[3px] h-10" 
    style={{ backgroundColor: colors.line }}></div>

    {/* Card */}
    <div
  className={`
    relative
    w-[360px]
    h-[160px]
    rounded-3xl
    border-2
    ${item.border}
    ${item.image?"bg-cover bg-center":item.bg}
    shadow-lg
    overflow-hidden
    transition-all
    duration-300
    hover:scale-105
    hover:-translate-y-2
    hover:shadow-2xl
  `}
  style={
  item.image
    ? { backgroundImage: `url("${item.image}")` }
    : undefined
}
>
  {/* White transparent overlay */}
  {item.image&&(
  <div className="absolute inset-0 bg-white/55"></div>
)}
  {/* Card content */}
 <div className="relative z-10 flex items-center justify-center text-center w-full h-full px-5 py-5">

    {/* Icon */}
  
    {/* Text */}
    <div className="w-full">
      <h2 className="text-[18px] font-serif font-semibold leading-6">
        {item.title}
      </h2>

      <p className="mt-2 text-[14px] text-gray-600 leading-6">
        {item.description}
      </p>
    </div>

  </div>
</div>
  </div>
))}
  </div>
</div>
</div>
  )};

  

export default SubCategoryPage;