import React, { useEffect, useState } from 'react'
import { Label } from './ui/label'
import { useDispatch, useSelector } from 'react-redux'
import { resetFilters, setSelectedIndustry, setSelectedLocation } from '@/redux/jobSlice'
import { Button } from './ui/button'
import { X } from 'lucide-react'

const filterData = [
    {
        filterType: "Location",
        array: ["Ha Noi", "Ho Chi Minh", "Da Nang", "Can Tho",
            "Ninh Thuan", "Thai Binh", "Bac Ninh"]
    },
    {
        filterType: "Industry",
        array: ["FullStack Developer", "Data Scientist", "DevOps Engineer",
            "Mobile Developer", "AI Researcher", "Software Engineer", "AI Engineer"]
    },
    {
        filterType: "Salary",
        array: ["10-20tr", "25-50tr", "> 50tr"]
    },
]

const FilterCard = () => {
    const dispatch = useDispatch();
    const { selectedIndustry, selectedLocation } = useSelector(state => state.job);

    const handleFilterClick = (type, value) => {
        // If this value is already selected, deselect it
        if (type === "Industry") {
            if (selectedIndustry === value) {
                dispatch(setSelectedIndustry(''));
            } else {
                dispatch(setSelectedIndustry(value));
            }
        } else if (type === "Location") {
            if (selectedLocation === value) {
                dispatch(setSelectedLocation(''));
            } else {
                dispatch(setSelectedLocation(value));
            }
        }
    };

    const handleResetFilters = () => {
        dispatch(resetFilters());
    };

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <div className="flex justify-between items-center">
                <h1 className='font-bold text-lg'>Filter Jobs</h1>
                {(selectedIndustry || selectedLocation) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs text-red-500"
                        onClick={handleResetFilters}
                    >
                        <X className="h-3 w-3" />
                        Reset
                    </Button>
                )}
            </div>
            <hr className='mt-3 mb-4' />
            
            {/* Industry filter section */}
            <div className="mb-4">
                <h2 className='font-bold text-lg'>Industry</h2>
                <div className="grid grid-cols-1 gap-1 mt-2">
                    {filterData[1].array.map((item, idx) => (
                        <div
                            key={`industry-${idx}`}
                            onClick={() => handleFilterClick("Industry", item)}
                            className={`px-2 py-1 text-sm rounded cursor-pointer transition-colors ${
                                selectedIndustry === item
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Location filter section */}
            <div className="mb-4">
                <h2 className='font-bold text-lg'>Location</h2>
                <div className="grid grid-cols-1 gap-1 mt-2">
                    {filterData[0].array.map((item, idx) => (
                        <div
                            key={`location-${idx}`}
                            onClick={() => handleFilterClick("Location", item)}
                            className={`px-2 py-1 text-sm rounded cursor-pointer transition-colors ${
                                selectedLocation === item
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Section displaying selected filters */}
            {(selectedIndustry || selectedLocation) && (
                <div className="border-t pt-3">
                    <h2 className="font-medium text-sm text-gray-700 mb-2">Filter by:</h2>
                    <div className="flex flex-col space-y-2">
                        {selectedIndustry && (
                            <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm flex items-center justify-between w-full">
                                <span>{selectedIndustry}</span>
                                <X
                                    className="h-4 w-4 cursor-pointer"
                                    onClick={() => dispatch(setSelectedIndustry(''))}
                                />
                            </div>
                        )}
                        {selectedLocation && (
                            <div className="bg-green-100 text-green-700 px-3 py-2 rounded text-sm flex items-center justify-between w-full">
                                <span>{selectedLocation}</span>
                                <X
                                    className="h-4 w-4 cursor-pointer"
                                    onClick={() => dispatch(setSelectedLocation(''))}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FilterCard