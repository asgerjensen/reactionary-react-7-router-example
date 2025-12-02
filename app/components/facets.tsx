import { Form } from "react-router";
import type { ProductSearchResult } from "@reactionary/core";
import { useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

export interface FacetsProps {
  productPage: ProductSearchResult;
  selectedFilters?: Record<string, string[]>;
}

export function Facets({ productPage, selectedFilters = {} }: FacetsProps) {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  const toggleFacet = (facetKey: string) => {
    const newExpanded = new Set(expandedFacets);
    if (newExpanded.has(facetKey)) {
      newExpanded.delete(facetKey);
    } else {
      newExpanded.add(facetKey);
    }
    setExpandedFacets(newExpanded);
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
                  const isSelected = selectedFilters[facetKey]?.includes(valueKey) || false;
                  
                  return (
                    <Form method="get" key={valueKey}>
                      <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          name={`filter_${facetKey}`}
                          value={valueKey}
                          defaultChecked={isSelected}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          onChange={(e) => {
                            const form = e.currentTarget.form;
                            if (form) {
                              form.requestSubmit();
                            }
                          }}
                        />
                        <span className="flex-1 text-sm text-gray-700">
                          {String(value.name || valueKey)}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {value.count}
                        </span>
                      </label>
                    </Form>
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
