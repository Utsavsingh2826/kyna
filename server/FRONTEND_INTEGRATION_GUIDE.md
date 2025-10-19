# 🎯 **Frontend Integration Guide - Kyna Jewels Products API**

## 📋 **Overview**

This guide provides everything the frontend team needs to integrate with the Kyna Jewels Products API. The API supports dynamic pricing, flexible image management, and comprehensive product data retrieval.

---

## 🚀 **Quick Start**

### **Base URL**
```
Development: https://api.kynajewels.com/api/products
Production: https://yourdomain.com/api/products
```

### **Authentication**
Currently no authentication required for product APIs. All endpoints are public.

---

## 📊 **API Endpoints Summary**

| Endpoint | Method | Description | Key Features |
|----------|--------|-------------|--------------|
| `/api/products` | GET | List products with pagination | Filters, sorting, pagination |
| `/api/products/:id/price` | GET | Get dynamic price | BOM details, attribute-based pricing |
| `/api/products/:id/images` | GET | Get dynamic images | Flexible naming, multiple views |
| `/api/products/:id` | GET | Get product details | Complete product information |
| `/api/products/search` | GET | Search products | Text search, category filters |
| `/api/products/filters` | GET | Get filter options | Available filters for UI |
| `/api/products/:id/bom` | GET | Get BOM details | Detailed cost breakdown |

---

## 🎨 **Frontend Implementation Examples**

### **1. Product Listing Page**

```javascript
// React component for product listing
import React, { useState, useEffect } from 'react';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    diamondShape: '',
    metal: '',
    minPrice: '',
    maxPrice: ''
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  return (
    <div className="product-listing">
      {loading ? (
        <div>Loading products...</div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProductCard = ({ product }) => (
  <div className="product-card">
    <img src={product.mainImage} alt={product.name} />
    <h3>{product.name}</h3>
    <p>₹{product.price.toLocaleString()}</p>
    <p>Rating: {product.rating}/5 ({product.reviews} reviews)</p>
  </div>
);
```

### **2. Product Detail Page with Dynamic Pricing**

```javascript
// React component for product details
import React, { useState, useEffect } from 'react';

const ProductDetail = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [price, setPrice] = useState(null);
  const [images, setImages] = useState(null);
  const [attributes, setAttributes] = useState({
    diamondShape: 'RD',
    diamondSize: 0.70,
    diamondColor: 'G',
    diamondOrigin: 'Natural',
    metal: 'RG',
    karat: 18,
    tone: '2T',
    finish: 'BR'
  });

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchPrice = async () => {
    try {
      const params = new URLSearchParams(attributes);
      const response = await fetch(`/api/products/${productId}/price?${params}`);
      const data = await response.json();
      if (data.success) {
        setPrice(data.data);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const params = new URLSearchParams(attributes);
      const response = await fetch(`/api/products/${productId}/images?${params}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.data.images);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  useEffect(() => {
    fetchPrice();
    fetchImages();
  }, [attributes]);

  const handleAttributeChange = (key, value) => {
    setAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail">
      <div className="product-images">
        <img src={images?.main} alt={product.name} />
        <div className="sub-images">
          {images?.sub.map((img, index) => (
            <img key={index} src={img} alt={`View ${index + 1}`} />
          ))}
        </div>
      </div>
      
      <div className="product-info">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        
        <div className="price-section">
          <h2>₹{price?.price?.toLocaleString()}</h2>
          {price?.breakdown && (
            <div className="price-breakdown">
              <p>Base Price: ₹{price.breakdown.basePrice.toLocaleString()}</p>
              <p>Diamond Cost: ₹{price.breakdown.diamondCost.toLocaleString()}</p>
              <p>Metal Cost: ₹{price.breakdown.metalCost.toLocaleString()}</p>
              <p>Making Charges: ₹{price.breakdown.makingCharges.toLocaleString()}</p>
              <p>GST: ₹{price.breakdown.gst.toLocaleString()}</p>
            </div>
          )}
        </div>
        
        <div className="attributes">
          <label>
            Diamond Shape:
            <select 
              value={attributes.diamondShape} 
              onChange={(e) => handleAttributeChange('diamondShape', e.target.value)}
            >
              <option value="RD">Round</option>
              <option value="PR">Princess</option>
              <option value="EM">Emerald</option>
              <option value="OV">Oval</option>
            </select>
          </label>
          
          <label>
            Diamond Size:
            <select 
              value={attributes.diamondSize} 
              onChange={(e) => handleAttributeChange('diamondSize', parseFloat(e.target.value))}
            >
              <option value={0.25}>0.25 carat</option>
              <option value={0.50}>0.50 carat</option>
              <option value={0.70}>0.70 carat</option>
              <option value={1.00}>1.00 carat</option>
            </select>
          </label>
          
          <label>
            Metal:
            <select 
              value={attributes.metal} 
              onChange={(e) => handleAttributeChange('metal', e.target.value)}
            >
              <option value="RG">Rose Gold</option>
              <option value="YG">Yellow Gold</option>
              <option value="WG">White Gold</option>
              <option value="PT">Platinum</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};
```

### **3. Search and Filter Component**

```javascript
// React component for search and filters
import React, { useState, useEffect } from 'react';

const SearchAndFilters = ({ onFiltersChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    diamondShape: '',
    metal: '',
    minPrice: '',
    maxPrice: ''
  });
  const [availableFilters, setAvailableFilters] = useState(null);

  const fetchFilters = async () => {
    try {
      const response = await fetch('/api/products/filters');
      const data = await response.json();
      if (data.success) {
        setAvailableFilters(data.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleSearch = () => {
    onFiltersChange({ ...filters, q: searchQuery });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="search-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      {availableFilters && (
        <div className="filters">
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {availableFilters.categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </option>
            ))}
          </select>
          
          <select 
            value={filters.diamondShape} 
            onChange={(e) => handleFilterChange('diamondShape', e.target.value)}
          >
            <option value="">All Shapes</option>
            {availableFilters.diamondShapes.map(shape => (
              <option key={shape.value} value={shape.value}>
                {shape.label} ({shape.count})
              </option>
            ))}
          </select>
          
          <select 
            value={filters.metal} 
            onChange={(e) => handleFilterChange('metal', e.target.value)}
          >
            <option value="">All Metals</option>
            {availableFilters.metals.map(metal => (
              <option key={metal.value} value={metal.value}>
                {metal.label} ({metal.count})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
```

---

## 🖼️ **Image Management**

### **Image URL Structure**
```
https://yourdomain.com/images/{category}/{identifier}-{view}.jpg
```

### **Dynamic Image Naming**
- **Format**: `SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW`
- **Examples**:
  - `GR1-RD-70-2T-BR-RG-GP.jpg` (Gents Ring)
  - `ENG1-PR-100-1T-PL-WG-GP.jpg` (Engagement Ring)
  - `BR1-RD-25-2T-PL-SL-GP.jpg` (Bracelet)

### **Image Views**
- **GP**: Ground View (main image)
- **SIDE**: Side view
- **TOP**: Top view
- **DETAIL**: Detail view
- **LIFESTYLE**: Lifestyle view
- **COMPARISON**: Comparison view
- **CUSTOM**: Custom view
- **360**: 360-degree view

### **Image Loading Strategy**
```javascript
// Lazy loading for images
const LazyImage = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`image-container ${className}`}>
      {!loaded && !error && <div className="image-placeholder">Loading...</div>}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
      />
      {error && <div className="image-error">Image not available</div>}
    </div>
  );
};
```

---

## 💰 **Dynamic Pricing Integration**

### **Price Calculation Flow**
1. User selects product attributes
2. Frontend sends attributes to `/api/products/:id/price`
3. Backend calculates price based on BOM
4. Frontend displays price and breakdown

### **Price Display Component**
```javascript
const PriceDisplay = ({ priceData }) => {
  if (!priceData) return <div>Calculating price...</div>;

  return (
    <div className="price-display">
      <div className="main-price">
        <h2>₹{priceData.price.toLocaleString()}</h2>
      </div>
      
      {priceData.breakdown && (
        <div className="price-breakdown">
          <h4>Price Breakdown</h4>
          <div className="breakdown-item">
            <span>Base Price:</span>
            <span>₹{priceData.breakdown.basePrice.toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span>Diamond Cost:</span>
            <span>₹{priceData.breakdown.diamondCost.toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span>Metal Cost:</span>
            <span>₹{priceData.breakdown.metalCost.toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span>Making Charges:</span>
            <span>₹{priceData.breakdown.makingCharges.toLocaleString()}</span>
          </div>
          <div className="breakdown-item">
            <span>GST (18%):</span>
            <span>₹{priceData.breakdown.gst.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 **Error Handling**

### **API Error Handling**
```javascript
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### **Error Boundary Component**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📱 **Responsive Design Considerations**

### **Mobile-First Approach**
```css
/* Mobile styles */
.product-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1rem;
}

/* Tablet styles */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### **Image Optimization**
```css
.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

/* Lazy loading placeholder */
.image-placeholder {
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
```

---

## 🚀 **Performance Optimization**

### **API Caching**
```javascript
// Simple cache implementation
const apiCache = new Map();

const cachedApiCall = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  const result = await apiCall(url, options);
  apiCache.set(cacheKey, result);
  
  // Clear cache after 5 minutes
  setTimeout(() => {
    apiCache.delete(cacheKey);
  }, 5 * 60 * 1000);

  return result;
};
```

### **Debounced Search**
```javascript
import { useDebounce } from 'use-debounce';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search products..."
    />
  );
};
```

---

## 📋 **Testing Checklist**

### **API Integration Testing**
- [ ] Product listing loads correctly
- [ ] Filters work as expected
- [ ] Search functionality works
- [ ] Dynamic pricing updates correctly
- [ ] Images load with correct URLs
- [ ] Error handling works properly
- [ ] Loading states display correctly

### **UI/UX Testing**
- [ ] Responsive design works on all devices
- [ ] Images load and display properly
- [ ] Price updates are smooth
- [ ] Attribute changes reflect immediately
- [ ] Error messages are user-friendly

---

## 🔗 **Useful Resources**

- [Products API README](./PRODUCTS_API_README.md) - Complete API documentation
- [BOM Integration Documentation](./BOM_INTEGRATION_DOCUMENTATION.md) - BOM system details
- [Flexible Naming Summary](./FLEXIBLE_NAMING_SUMMARY.md) - Image naming convention
- [API Endpoints Documentation](./API_ENDPOINTS.md) - All available endpoints

---

## 📞 **Support**

For any questions or issues with the API integration:

1. Check the API documentation first
2. Verify server is running on correct port
3. Check network requests in browser dev tools
4. Review error messages and status codes
5. Contact backend team for assistance

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**For:** Frontend Development Team
