/**
 * APIFeatures class for advanced querying, filtering, sorting, pagination
 * Used by MongoDB controllers for consistent API behavior
 */
class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    /**
     * Filter results based on query parameters
     * Handles special parameters like gt, gte, lt, lte, in
     */
    filter() {
      // Make a copy of the query object
      const queryObj = { ...this.queryString };
      
      // Fields to exclude from filtering
      const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'q'];
      excludedFields.forEach(field => delete queryObj[field]);
      
      // Advanced filtering with operators like gt, gte, lt, lte
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
      
      // Parse the JSON string back to an object
      this.query = this.query.find(JSON.parse(queryStr));
      
      return this;
    }
  
    /**
     * Implement search functionality across multiple fields
     */
    search() {
      const searchTerm = this.queryString.search || this.queryString.q;
      
      if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, 'i');
        
        // Set fields to search in - customize based on your model
        this.query = this.query.find({
          $or: [
            { make: searchRegex },
            { model: searchRegex },
            { description: searchRegex }
          ]
        });
      }
      
      return this;
    }
  
    /**
     * Sort results based on sort parameter
     * Default sort is by createdAt in descending order
     */
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        // Default sort
        this.query = this.query.sort('-createdAt');
      }
      
      return this;
    }
  
    /**
     * Select specific fields to include in response
     */
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        // Exclude Mongoose internal field by default
        this.query = this.query.select('-__v');
      }
      
      return this;
    }
  
    /**
     * Paginate results
     */
    paginate() {
      // Parse page and limit parameters, set defaults
      const page = parseInt(this.queryString.page, 10) || 1;
      const limit = parseInt(this.queryString.limit, 10) || 10;
      const skip = (page - 1) * limit;
      
      // Apply skip and limit to query
      this.query = this.query.skip(skip).limit(limit);
      
      return this;
    }
  
    /**
     * Get total count of documents matching the query
     * (without pagination)
     */
    async getTotalCount() {
      // Create a copy of the query
      const countQuery = this.query.model.find(this.query._conditions);
      return await countQuery.countDocuments();
    }
  }
  
  module.exports = APIFeatures;