import React from 'react';
import styled from 'styled-components';
import { FiFilter, FiX } from 'react-icons/fi';

const FiltersContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  max-width: 100%;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      color: #3b82f6;
      font-size: 1.5rem;
    }
  }
`;

const ClearButton = styled.button`
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  color: #dc2626;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #ef4444;
    color: #b91c1c;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  > label {
    display: block;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
    font-size: 0.9375rem;
    letter-spacing: 0.3px;
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1f2937;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover:not(:focus) {
    border-color: #cbd5e1;
  }
`;

const PriceRange = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
`;

const PriceInputWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  
  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1f2937;
    background: #f9fafb;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &::placeholder {
      color: #9ca3af;
      font-weight: 400;
    }
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:hover:not(:focus) {
      border-color: #cbd5e1;
    }
  }
`;

const PriceSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 600;
  font-size: 1rem;
  padding-top: 1.5rem;
  
  @media (max-width: 639px) {
    padding-top: 0;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  input {
    margin: 0;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #3b82f6;
  }
  
  &:hover {
    color: #3b82f6;
    background: #f0f9ff;
  }
`;

const ProductFilters = ({ filters = {}, onFilterChange, onClearFilters }) => {
  const handleFilterChange = (filterType, value) => {
    if (onFilterChange) {
      onFilterChange(filterType, value);
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <FiltersContainer>
      <FiltersHeader>
        <h3>
          <FiFilter />
          Filters
        </h3>
        <ClearButton onClick={handleClearFilters}>
          <FiX />
          Clear All
        </ClearButton>
      </FiltersHeader>

      <FilterGroup>
        <label>Category</label>
        <FilterSelect
          value={filters.category || ''}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="ro">RO Water Purifiers</option>
          <option value="uv">UV Water Filters</option>
          <option value="alkaline">Alkaline Water Purifiers</option>
          <option value="gravity">Gravity Based Filters</option>
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <label>Price Range (₹)</label>
        <PriceRange>
          <PriceInputWrapper>
            <label>Minimum</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              min="0"
            />
          </PriceInputWrapper>
          <PriceSeparator>—</PriceSeparator>
          <PriceInputWrapper>
            <label>Maximum</label>
            <input
              type="number"
              placeholder="₹50,000"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </PriceInputWrapper>
        </PriceRange>
      </FilterGroup>

      <FilterGroup>
        <label>Brand</label>
        <CheckboxGroup>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.brands?.includes('aquaguard') || false}
              onChange={(e) => {
                const brands = filters.brands || [];
                const newBrands = e.target.checked 
                  ? [...brands, 'aquaguard']
                  : brands.filter(b => b !== 'aquaguard');
                handleFilterChange('brands', newBrands);
              }}
            />
            Aquaguard
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.brands?.includes('kent') || false}
              onChange={(e) => {
                const brands = filters.brands || [];
                const newBrands = e.target.checked 
                  ? [...brands, 'kent']
                  : brands.filter(b => b !== 'kent');
                handleFilterChange('brands', newBrands);
              }}
            />
            Kent
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.brands?.includes('pureit') || false}
              onChange={(e) => {
                const brands = filters.brands || [];
                const newBrands = e.target.checked 
                  ? [...brands, 'pureit']
                  : brands.filter(b => b !== 'pureit');
                handleFilterChange('brands', newBrands);
              }}
            />
            Pureit
          </CheckboxItem>
        </CheckboxGroup>
      </FilterGroup>

      <FilterGroup>
        <label>Capacity</label>
        <FilterSelect
          value={filters.capacity || ''}
          onChange={(e) => handleFilterChange('capacity', e.target.value)}
        >
          <option value="">All Capacities</option>
          <option value="5-7">5-7 Liters</option>
          <option value="8-10">8-10 Liters</option>
          <option value="12-15">12-15 Liters</option>
          <option value="15+">15+ Liters</option>
        </FilterSelect>
      </FilterGroup>

      <FilterGroup>
        <label>Features</label>
        <CheckboxGroup>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.features?.includes('mineralizer') || false}
              onChange={(e) => {
                const features = filters.features || [];
                const newFeatures = e.target.checked 
                  ? [...features, 'mineralizer']
                  : features.filter(f => f !== 'mineralizer');
                handleFilterChange('features', newFeatures);
              }}
            />
            Mineralizer
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.features?.includes('tds-controller') || false}
              onChange={(e) => {
                const features = filters.features || [];
                const newFeatures = e.target.checked 
                  ? [...features, 'tds-controller']
                  : features.filter(f => f !== 'tds-controller');
                handleFilterChange('features', newFeatures);
              }}
            />
            TDS Controller
          </CheckboxItem>
          <CheckboxItem>
            <input
              type="checkbox"
              checked={filters.features?.includes('storage-tank') || false}
              onChange={(e) => {
                const features = filters.features || [];
                const newFeatures = e.target.checked 
                  ? [...features, 'storage-tank']
                  : features.filter(f => f !== 'storage-tank');
                handleFilterChange('features', newFeatures);
              }}
            />
            Storage Tank
          </CheckboxItem>
        </CheckboxGroup>
      </FilterGroup>
    </FiltersContainer>
  );
};

export default ProductFilters;