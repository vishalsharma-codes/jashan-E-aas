import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-charcoal to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-crimson/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-9xl font-bold text-gold/20 mb-4"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          The page you're looking for seems to have vanished like a sunset after an unforgettable event.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gold hover:bg-gold-dark text-background">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-gold/50 hover:bg-gold/10">
            <Link to="/vendors">
              <Search className="w-5 h-5 mr-2" />
              Find Vendors
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
