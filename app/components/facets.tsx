import { useSearchParams } from "react-router";
import type { ProductSearchResult } from "@reactionary/core";
import { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

export interface FacetsProps {
  productPage: ProductSearchResult;
}

export function Facets({ productPage }: FacetsProps) {
  const [searchParams] = useSearchParams();
  
  // Auto-expand facets that have selected filters
  const getInitialExpandedFacets = () => {
    const expanded = new Set<string>();
    productPage.facets?.forEach(facet => {
      const selectedFilters = searchParams.getAll(`filter_${facet.identifier.key}`);
      if (selectedFilters.length > 0) {
        expanded.add(facet.identifier.key);
      }
    });
    return expanded;
  };
  
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(getInitialExpandedFacets);

  const toggleFacet = (facetKey: string) => {
    const newExpanded = new Set(expandedFacets);
    if (newExpanded.has(facetKey)) {
      newExpanded.delete(facetKey);
    } else {
      newExpanded.add(facetKey);
    }
    setExpandedFacets(newExpanded);
  };

  // Get currently selected filters from URL
  const getSelectedFilters = (facetKey: string): string[] => {
    return searchParams.getAll(`filter_${facetKey}`);
  };

  // Handle filter change
  const handleFilterChange = (facetKey: string, valueKey: string, isChecked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    const filterKey = `filter_${facetKey}`;
    
    if (isChecked) {
      // Add the filter value
      newParams.append(filterKey, valueKey);
    } else {
      // Remove this specific filter value
      const allValues = newParams.getAll(filterKey);
      newParams.delete(filterKey);
      allValues.forEach(val => {
        if (val !== valueKey) {
          newParams.append(filterKey, val);
        }
      });
    }
    
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    
    // Submit the form
    const form = document.createElement('form');
    form.method = 'get';
    form.action = window.location.pathname;
    newParams.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };


  if (!productPage.facets || productPage.facets.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      {productPage.facets.map((facet) => {
        const facetKey = String(facet.identifier.key);
        const isExpanded = expandedFacets.has(facetKey);
        
        return (
          <div key={facetKey} className="border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFacet(facetKey)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-semibold text-gray-800 capitalize">
                {String(facet.name || facetKey).replace(/_/g, ' ').replace('attributes.', '').replace(/-/g, ' ')}
              </span>
              {isExpanded ? (
                <BiChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <BiChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {isExpanded && facet.values && facet.values.length > 0 && (
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {facet.values.map((value) => {
                  const valueKey = String(value.identifier.key);
                  const selectedValues = getSelectedFilters(facetKey);
                  const isSelected = selectedValues.includes(valueKey);
                  
                  return (
                    <label key={valueKey} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleFilterChange(facetKey, valueKey, e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="flex-1 text-sm text-gray-700">
                        {String(value.name || valueKey)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {value.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
