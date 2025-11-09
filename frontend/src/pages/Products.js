import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiX, FiTrendingUp, FiTag, FiStar } from 'react-icons/fi';

// Components
import ProductGrid from '../components/Product/ProductGrid';
import ProductFilters from '../components/Product/ProductFilters';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

// Utils
import { productsAPI } from '../utils/api';
import { CATEGORIES } from '../utils/constants';

const ProductsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 4rem 2rem 3rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
  }
`;

const HeroContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageDescription = styled.p`
  font-size: 1.2rem;
  opacity: 0.95;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  text-align: center;
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    display: block;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const ProductsContent = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FiltersSection = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 2rem;
  
  @media (max-width: 1024px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
    overflow-y: auto;
    display: ${props => props.isFiltersOpen ? 'block' : 'none'};
  }
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const CloseFiltersButton = styled.button`
  display: none;
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
  }
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const ProductsSection = styled.div``;

const Toolbar = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ResultsInfo = styled.div`
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #3b82f6;
  }
`;

const ViewControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#f9fafb'};
    border-color: ${props => props.active ? '#2563eb' : '#cbd5e1'};
    transform: translateY(-2px);
  }
`;

const MobileFilterButton = styled.button`
  display: none;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const SortSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6b7280;
    margin-bottom: 2rem;
  }
`;

const ClearFiltersButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
`;

const ActiveFiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #3b82f6;
  
  button {
    background: none;
    border: none;
    color: #1e40af;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0;
    margin-left: 0.25rem;
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.2);
    }
  }
`;

const PageButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;

  &:hover:not(:disabled) {
    background: ${props => props.active ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#f9fafb'};
    border-color: ${props => props.active ? '#2563eb' : '#cbd5e1'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Get initial filters from URL
  const initialFilters = {
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'name',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  };

  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getProducts(filters);
      if (response.data.success) {
        setProducts(response.data.data || []);
        setPagination(response.data.pagination || {
          page: 1,
          pages: 1,
          total: 0,
          limit: 12,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setPagination({
        page: 1,
        pages: 1,
        total: 0,
        limit: 12,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sortBy: 'name',
      page: 1,
      limit: 12
    });
  };

  const getCategoryName = (categoryValue) => {
    const category = CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : 'All Products';
  };

  const getResultsText = () => {
    if (!pagination || pagination.total === 0) {
      return 'No products found';
    }
    
    const { total = 0, page = 1, limit = 12 } = pagination;
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    
    return `Showing ${start}-${end} of ${total} products`;
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.search) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.rating) count++;
    return count;
  };

  const getActiveFilters = () => {
    const active = [];
    if (filters.category) active.push({ key: 'category', label: getCategoryName(filters.category), value: filters.category });
    if (filters.search) active.push({ key: 'search', label: `Search: "${filters.search}"`, value: filters.search });
    if (filters.minPrice) active.push({ key: 'minPrice', label: `Min: ₹${filters.minPrice}`, value: filters.minPrice });
    if (filters.maxPrice) active.push({ key: 'maxPrice', label: `Max: ₹${filters.maxPrice}`, value: filters.maxPrice });
    if (filters.rating) active.push({ key: 'rating', label: `${filters.rating}+ Stars`, value: filters.rating });
    return active;
  };

  const removeFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: '', page: 1 }));
  };

  return (
    <ProductsContainer>
      <HeroSection>
        <HeroContent>
          <PageHeader>
            <PageTitle>
              {filters.category ? getCategoryName(filters.category) : 'Premium Water Filters'}
              {filters.search && ` for "${filters.search}"`}
            </PageTitle>
            <PageDescription>
              Discover our range of high-quality water filtration systems designed for pure, healthy living
            </PageDescription>
          </PageHeader>
          
          <StatsBar>
            <StatItem>
              <span className="stat-number">{pagination.total || 0}</span>
              <span className="stat-label">Products Available</span>
            </StatItem>
            <StatItem>
              <span className="stat-number">5★</span>
              <span className="stat-label">Top Rated</span>
            </StatItem>
            <StatItem>
              <span className="stat-number">100%</span>
              <span className="stat-label">Quality Assured</span>
            </StatItem>
          </StatsBar>
        </HeroContent>
      </HeroSection>

      <ContentWrapper>
        <ProductsContent>
          <FiltersSection isFiltersOpen={isFiltersOpen}>
            <FilterHeader>
              <h3>
                <FiFilter />
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </h3>
              <CloseFiltersButton onClick={() => setIsFiltersOpen(false)}>
                <FiX />
              </CloseFiltersButton>
            </FilterHeader>
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </FiltersSection>

          <ProductsSection>
            {getActiveFilters().length > 0 && (
              <ActiveFiltersBar>
                {getActiveFilters().map((filter) => (
                  <FilterChip key={filter.key}>
                    <FiTag size={14} />
                    {filter.label}
                    <button onClick={() => removeFilter(filter.key)}>
                      <FiX size={16} />
                    </button>
                  </FilterChip>
                ))}
                {getActiveFilters().length > 1 && (
                  <FilterChip style={{ background: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}>
                    Clear All
                    <button onClick={clearFilters}>
                      <FiX size={16} />
                    </button>
                  </FilterChip>
                )}
              </ActiveFiltersBar>
            )}

            <Toolbar>
              <ResultsInfo>
                <FiTrendingUp />
                {getResultsText()}
              </ResultsInfo>

              <MobileFilterButton
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <FiFilter />
                {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
              </MobileFilterButton>

              <SortSelect
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </SortSelect>

              <ViewControls>
                <ViewButton
                  active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <FiGrid />
                </ViewButton>
                <ViewButton
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <FiList />
                </ViewButton>
              </ViewControls>
            </Toolbar>

            {loading ? (
              <LoadingSpinner text="Loading products..." />
            ) : products.length === 0 ? (
              <EmptyState>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms to find what you're looking for</p>
                <ClearFiltersButton onClick={clearFilters}>
                  Clear All Filters
                </ClearFiltersButton>
              </EmptyState>
            ) : (
              <>
                <ProductGrid 
                  products={products} 
                  viewMode={viewMode}
                />
                
                {pagination.pages > 1 && (
                  <Pagination>
                    <PageButton
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(pagination.page - 1)}
                    >
                      Previous
                    </PageButton>

                    {[...Array(pagination.pages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show only nearby pages
                      if (
                        pageNumber === 1 ||
                        pageNumber === pagination.pages ||
                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                      ) {
                        return (
                          <PageButton
                            key={pageNumber}
                            active={pageNumber === pagination.page}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PageButton>
                        );
                      } else if (
                        pageNumber === pagination.page - 2 ||
                        pageNumber === pagination.page + 2
                      ) {
                        return <span key={pageNumber} style={{ color: '#9ca3af' }}>...</span>;
                      }
                      return null;
                    })}

                    <PageButton
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(pagination.page + 1)}
                    >
                      Next
                    </PageButton>
                  </Pagination>
                )}
              </>
            )}
          </ProductsSection>
        </ProductsContent>
      </ContentWrapper>
    </ProductsContainer>
  );
};

export default Products;