import { useNavigate, useLocation } from "react-router-dom";
import { SpotlightReels } from "@/components/SpotlightReels";

export default function Reels() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = () => {
    // Opened from inside the app: go back, so Jhalak leaves the history
    if (location.key !== "default") {
      navigate(-1);
    } else {
      // Opened directly (typed URL or refresh): go home without keeping Jhalak behind
      navigate("/", { replace: true });
    }
  };

  return <SpotlightReels isOpen={true} onClose={handleClose} />;
}