import React from "react";
import { GroceryList } from "../../components/GroceryList/GroceryList";
import BottomNavBar from "../../components/NavigationBar/BottomNavBar/BottomNavBar";

interface GroceryListPageProps {
  userId: number | null;
  accessToken: string;
}

const GroceryListPage: React.FC<GroceryListPageProps> = ({
  userId,
  accessToken,
}) => {
  if (!userId || !accessToken) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Please login first</h2>
      </div>
    );
  }

  return (
    <div>
      <GroceryList userId={userId} accessToken={accessToken} />
      <BottomNavBar />
    </div>
  );
};

export default GroceryListPage;
