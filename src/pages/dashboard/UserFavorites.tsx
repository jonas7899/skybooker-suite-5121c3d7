import React from 'react';
import { Heart } from 'lucide-react';

const UserFavorites: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          Favorites
        </h1>
        <p className="text-muted-foreground">
          Your saved flight experiences
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-display font-semibold mb-2">
          No favorites saved
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Save experiences you love and they'll appear here for easy access.
        </p>
      </div>
    </div>
  );
};

export default UserFavorites;
