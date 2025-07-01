import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allJobs: [],
    singleJob: null,
    allAdminJobs: [],
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: "",
    filterType: "",
    selectedIndustry: "",
    selectedLocation: "",
    allJobsAdmin: [] // Added new state to store all jobs from admin view
}

const jobSlice = createSlice({
    name: "job",
    initialState,
    reducers: {
        // actions
        setAllJobs: (state, action) => {
            state.allJobs = action.payload;
        },
        setSingleJob: (state, action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs: (state, action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText: (state, action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs: (state, action) => {
            state.allAppliedJobs = action.payload;
        },
        setSearchedQuery: (state, action) => {
            state.searchedQuery = action.payload;
        },
        setFilterType: (state, action) => {
            state.filterType = action.payload;
        },
        // Added new action to update industry filter
        setSelectedIndustry: (state, action) => {
            state.selectedIndustry = action.payload;
        },
        // Added new action to update location filter
        setSelectedLocation: (state, action) => {
            state.selectedLocation = action.payload;
        },
        // Added action to reset all filters
        resetFilters: (state) => {
            state.searchedQuery = "";
            state.filterType = "";
            state.selectedIndustry = "";
            state.selectedLocation = "";
        },        // Added new action to store all jobs from admin view
        setAllJobsAdmin: (state, action) => {
            state.allJobsAdmin = action.payload;
        },
        // Added action to remove applied job when applicant cancels application
        removeAppliedJob: (state, action) => {
            state.allAppliedJobs = state.allAppliedJobs.filter(job => job._id !== action.payload);
        }
    }
});

export const {
    setAllJobs,
    setSingleJob,
    setAllAdminJobs,
    setSearchJobByText,
    setAllAppliedJobs,
    setSearchedQuery,
    setFilterType,
    setSelectedIndustry,
    setSelectedLocation,
    resetFilters,
    setAllJobsAdmin,
    removeAppliedJob
} = jobSlice.actions;

export default jobSlice.reducer;