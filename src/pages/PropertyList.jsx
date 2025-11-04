import React, { useState, useCallback } from 'react';
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import FilterSidebar from '../components/FilterSidebar';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard';
import useFilters from '../hooks/useFilters';
import useListings from '../hooks/useListings';
import './PropertyList.css';

/**
 * Property List Page
 * Main page for displaying property listings with filters
 */
const PropertyList = () => {
  const [searchParams, setSearchParams] = useState({
    destination: 'Jaipur, Rajasthan',
    checkIn: 'Fri 12/2023',
    checkOut: 'Sun 16/2023',
    guests: 2,
    rooms: 1,
  });

  // Use filters hook
  const {
    filters,
    toggleFilter,
    toggleArrayFilter,
    updatePriceRange,
    resetFilters,
    getQueryParams,
  } = useFilters();

  // Use listings hook with filters
  const { properties, totalCount, loading, hasMore, loadMore } = useListings(getQueryParams());

  // Handle search form submission
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setSearchParams({
      destination: formData.get('destination'),
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      guests: formData.get('guests'),
      rooms: formData.get('rooms'),
    });
    toast.success('Search updated!');
  }, []);

  // Handle load more with toast
  const handleLoadMore = useCallback(() => {
    const loadingToast = toast.loading('Loading...');
    loadMore();
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Loaded more properties!');
    }, 500);
  }, [loadMore]);

  // Handle navigation button clicks
  const handleNavClick = useCallback((label) => {
    toast.info(`Coming soon: ${label}!`);
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={`Hotels in ${searchParams.destination} | TOUR - Best Prices`}
        description={`Find and book the best hotels in ${searchParams.destination}. Compare prices, read reviews, and get the best deals on accommodation.`}
        keywords="hotel booking, hotels, accommodation, best hotel deals, hotel search"
        canonical="/properties"
      />

      <div className="property-list-page">
        {/* Header Component */}
        <Header />

        {/* Secondary Navigation */}
        <div className="secondary-nav">
          <div className="secondary-nav-container">
            <nav className="secondary-nav-list">
              <button className="secondary-nav-item active">
                <MapPin size={18} />
                Find Stays
              </button>
              <button className="secondary-nav-item" onClick={() => handleNavClick('Find Flight')}>
                Find Flight
              </button>
              <button className="secondary-nav-item" onClick={() => handleNavClick('Find Cruise')}>
                Find Cruise
              </button>
              <button className="secondary-nav-item" onClick={() => handleNavClick('Find Cars')}>
                Find Cars
              </button>
            </nav>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-section-container">
            <form onSubmit={handleSearch} className="search-form">
              {/* Destination */}
              <div className="search-form-field destination">
                <label className="search-form-label">
                  Enter Destination
                </label>
                <div className="search-form-input-wrapper">
                  <MapPin className="search-form-input-icon" size={18} />
                  <input
                    type="text"
                    name="destination"
                    defaultValue={searchParams.destination}
                    className="search-form-input"
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              {/* Check In */}
              <div className="search-form-field">
                <label className="search-form-label">
                  Check In
                </label>
                <div className="search-form-input-wrapper">
                  <Calendar className="search-form-input-icon" size={18} />
                  <input
                    type="text"
                    name="checkIn"
                    defaultValue={searchParams.checkIn}
                    className="search-form-input"
                    placeholder="Check in date"
                  />
                </div>
              </div>

              {/* Check Out */}
              <div className="search-form-field">
                <label className="search-form-label">
                  Check Out
                </label>
                <div className="search-form-input-wrapper">
                  <Calendar className="search-form-input-icon" size={18} />
                  <input
                    type="text"
                    name="checkOut"
                    defaultValue={searchParams.checkOut}
                    className="search-form-input"
                    placeholder="Check out date"
                  />
                </div>
              </div>

              {/* Rooms & Guests */}
              <div className="search-form-field">
                <label className="search-form-label">
                  Rooms & Guests
                </label>
                <div className="search-form-input-wrapper">
                  <Users className="search-form-input-icon" size={18} />
                  <select
                    name="guests"
                    defaultValue={`${searchParams.rooms} room, ${searchParams.guests} guests`}
                    className="search-form-select"
                  >
                    <option>1 room, 2 guests</option>
                    <option>2 rooms, 4 guests</option>
                    <option>3 rooms, 6 guests</option>
                  </select>
                  <ChevronDown className="search-form-select-icon" size={18} />
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="search-form-submit"
              >
                <Search size={20} className="inline mr-2" />
                Update Search
              </button>
            </form>
          </div>
        </div>

        {/* Results Header */}
        <div className="results-header">
          <div className="results-header-container">
            <div className="results-header-content">
              <div>
                <p className="results-breadcrumb">
                  Home › Hotels and more in Destination District
                </p>
                <h1 className="results-title">
                  {totalCount} Properties in {searchParams.destination.split(',')[0]} District
                </h1>
              </div>

              {/* Sort By */}
              <div className="results-sort">
                <span className="results-sort-label">Sort by</span>
                <select className="results-sort-select">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="main-content-wrapper">
            {/* Filters Sidebar */}
            <FilterSidebar
              filters={filters}
              onToggleFilter={toggleFilter}
              onToggleArrayFilter={toggleArrayFilter}
              onUpdatePriceRange={updatePriceRange}
              onResetFilters={resetFilters}
            />

            {/* Property Listings */}
            <div className="property-listings">
              <div className="property-listings-container">
                {loading && properties.length === 0 ? (
                  // Skeleton loaders
                  <>
                    {[...Array(6)].map((_, i) => (
                      <PropertyCardSkeleton key={i} />
                    ))}
                  </>
                ) : (
                  // Property cards
                  <>
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="load-more-container">
                        <button
                          onClick={handleLoadMore}
                          disabled={loading}
                          className="load-more-button"
                        >
                          {loading ? 'Loading...' : 'Show more results'}
                        </button>
                      </div>
                    )}

                    {/* No more results */}
                    {!hasMore && properties.length > 0 && (
                      <div className="no-more-results">
                        No more properties to show
                      </div>
                    )}

                    {/* No results */}
                    {properties.length === 0 && !loading && (
                      <div className="no-results">
                        <h3 className="no-results-title">
                          No properties found
                        </h3>
                        <p className="no-results-text">
                          Try adjusting your filters or search criteria
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default PropertyList;
