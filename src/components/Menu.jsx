import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiShoppingCart,
  FiSearch,
  FiXCircle,
  FiMinus,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";
import { db } from "../config"; // Firebase config file
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Squares from "./Squares";

const Menu = () => {
  const { cart, addToCart, removeFromCart, decreaseQuantity } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate?.() || { push: () => {} };

  // Optimize fetching by using useCallback
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [menuItems, searchTerm]);

  // Get item quantity in cart - updated to count identical items
  const getItemQuantity = useCallback(
    (itemId) => {
      return cart.filter((item) => item.id === itemId).length;
    },
    [cart]
  );

  // Calculate total cart quantity
  const getTotalCartQuantity = useCallback(() => {
    return cart.length;
  }, [cart]);

  // Check if cart has any items
  const hasItemsInCart = useMemo(() => {
    return cart.length > 0;
  }, [cart]);

  // Navigate to cart
  const handleGoToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  // Safe check for window object
  const isBrowser = typeof window !== "undefined";

  return (
    <div className="relative min-h-screen pt-16 pb-24 px-3 sm:px-4 md:px-8 lg:px-16">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute inset-0 w-full h-full opacity-20">
          {isBrowser && window.innerWidth > 768 && (
            <Squares
              direction="diagonal"
              speed={0.5}
              borderColor="#ff4800"
              squareSize={50}
              hoverFillColor="#ff480033"
            />
          )}
        </div>
        <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ff4800_100%)] opacity-60"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto py-10">
        {/* Page Header with animated gradient */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
            Our Menu
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto text-base sm:text-lg px-2">
            Explore our delicious offerings crafted with care.
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-10 border border-orange-900/50 shadow-lg hover:border-orange-700 transition-all duration-300">
          <div className="relative flex items-center">
            <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-orange-500 text-lg" />
            <input
              type="text"
              placeholder="Search for your favorite dish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 sm:py-4 pl-10 sm:pl-12 pr-4 rounded-full border-2 border-orange-600/70 focus:border-orange-500 focus:ring focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300 bg-black bg-opacity-70 text-white text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 sm:right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <FiXCircle />
              </button>
            )}
          </div>
        </div>

        {/* Menu Grid with improved card design */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-orange-800 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-black bg-opacity-60 rounded-xl">
            <FiXCircle className="text-orange-500 text-3xl sm:text-4xl mx-auto mb-3" />
            <p className="text-lg sm:text-xl text-gray-300 px-4">
              No items found. Try another search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredItems.map((item) => {
              const isUnavailable = item.isAvailable === false;
              const itemQuantity = getItemQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-black bg-opacity-70 backdrop-blur-sm rounded-xl overflow-hidden border border-orange-900/50 ${
                    isUnavailable
                      ? "opacity-75"
                      : "shadow-lg hover:shadow-orange-700/30 hover:border-orange-700 hover:-translate-y-1"
                  } transition-all duration-300`}
                >
                  <div className="h-48 sm:h-56 overflow-hidden relative">
                    <img
                      src={
                        item.image ||
                        "https://via.placeholder.com/400x300?text=Food+Image"
                      }
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        isUnavailable ? "grayscale" : "hover:scale-110"
                      }`}
                      loading="lazy"
                    />
                    {item.isNew && !isUnavailable && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
                        NEW
                      </div>
                    )}
                    {item.isPopular && !isUnavailable && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
                        POPULAR
                      </div>
                    )}
                    {item.category && !isUnavailable && (
                      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-black bg-opacity-70 text-orange-400 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                        {item.category}
                      </div>
                    )}
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                        <FiXCircle className="text-orange-500 text-2xl sm:text-3xl mb-1 sm:mb-2" />
                        <span className="text-orange-500 text-sm sm:text-base font-bold px-3 sm:px-4 py-1 sm:py-2 bg-black bg-opacity-70 rounded-lg">
                          NOT AVAILABLE
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <h3
                        className={`text-base sm:text-lg font-bold ${
                          isUnavailable ? "text-gray-500" : "text-gray-100"
                        }`}
                      >
                        {item.name}
                      </h3>
                      <div
                        className={`text-base sm:text-lg font-bold ${
                          isUnavailable
                            ? "text-gray-500"
                            : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                        }`}
                      >
                        Rs {item.price?.toFixed(2) || "9.99"}
                      </div>
                    </div>
                    {!isUnavailable && (
                      <>
                        {itemQuantity > 0 ? (
                          <div className="flex items-center justify-between mt-4">
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              className="flex items-center justify-center bg-gradient-to-r from-orange-800 to-red-800 text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full active:scale-95 transition-transform hover:shadow-lg hover:shadow-orange-700/20"
                            >
                              <FiMinus />
                            </button>

                            <div className="text-gray-200 font-semibold text-sm sm:text-base">
                              {itemQuantity} in cart
                            </div>

                            <button
                              onClick={() => addToCart(item)}
                              className="flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-600 text-white h-9 w-9 sm:h-10 sm:w-10 rounded-full active:scale-95 transition-transform hover:shadow-lg hover:shadow-orange-700/20"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 sm:py-3 rounded-full w-full active:scale-95 transition-transform mt-4 hover:shadow-lg hover:shadow-orange-700/20"
                          >
                            <FiShoppingCart className="text-base sm:text-lg" />
                            <span className="font-medium text-sm sm:text-base">
                              Add to Cart
                            </span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Improved Go to Cart button */}
      {hasItemsInCart && (
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full px-4 sm:w-auto">
          <button
            onClick={handleGoToCart}
            className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-orange-600 to-red-600 text-white w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-xl hover:shadow-orange-600/40 active:scale-95 transition-all duration-300"
          >
            <FiShoppingBag className="text-lg sm:text-xl" />
            <span className="font-semibold text-sm sm:text-base">
              Go to Cart ({getTotalCartQuantity()})
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
