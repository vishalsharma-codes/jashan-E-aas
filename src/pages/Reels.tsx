import { useNavigate } from "react-router-dom";
import { SpotlightReels } from "@/components/SpotlightReels";

export default function Reels() {
  const navigate = useNavigate();

  return (
    <SpotlightReels
      isOpen={true}
      onClose={() => navigate("/")}
    />
  );
}
