import React, { useState, useContext, useEffect, useRef } from 'react'
import './SearchPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const SearchPopup = ({ setShowSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const { food_list } = useContext(StoreContext);
  const inputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClose = () => {
    setShowSearch(false);
    setSearchQuery('');
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Filter food items based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = food_list.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
    
    setFilteredItems(filtered);
  }, [searchQuery, food_list]);

  // Removed handleItemClick - let FoodItem handle clicks naturally
  // Users can add items to cart without closing the search popup

  return (
    <div className="search-popup" onClick={handleClose}>
      <div className="search-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-popup-header">
          <h2>Search Food Items</h2>
          <img 
            src={assets.cross_icon} 
            alt="Close" 
            onClick={handleClose}
            className="search-popup-close"
          />
        </div>
        
        <div className="search-popup-input-wrapper">
          <img src={assets.search_icon} alt="Search" className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-popup-input"
          />
          {searchQuery && (
            <img 
              src={assets.cross_icon} 
              alt="Clear" 
              onClick={() => setSearchQuery('')}
              className="search-clear-icon"
            />
          )}
        </div>

        <div className="search-results">
          {searchQuery.trim() === '' ? (
            <div className="search-empty-state">
              <p>Start typing to search for food items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="search-empty-state">
              <p>No items found matching "{searchQuery}"</p>
              <p className="search-hint">Try searching by name, description, or category</p>
            </div>
          ) : (
            <>
              <div className="search-results-header">
                <p>Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="search-results-grid">
                {filteredItems.map((item) => (
                  <div key={item._id} className="search-result-item">
                    <FoodItem 
                      image={item.image}
                      name={item.name}
                      price={item.price}
                      desc={item.description}
                      id={item._id}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;

