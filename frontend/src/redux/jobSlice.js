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
    allJobsAdmin: [] // Thêm state mới để lưu tất cả job từ admin view
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
        // Thêm action mới để cập nhật lọc industry
        setSelectedIndustry: (state, action) => {
            state.selectedIndustry = action.payload;
        },
        // Thêm action mới để cập nhật lọc location
        setSelectedLocation: (state, action) => {
            state.selectedLocation = action.payload;
        },
        // Thêm action để reset các bộ lọc
        resetFilters: (state) => {
            state.searchedQuery = "";
            state.filterType = "";
            state.selectedIndustry = "";
            state.selectedLocation = "";
        },        // Thêm action mới để lưu tất cả job từ admin view
        setAllJobsAdmin: (state, action) => {
            state.allJobsAdmin = action.payload;
        },
        // Thêm action để xóa job đã apply khi applicant hủy đơn ứng tuyển
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