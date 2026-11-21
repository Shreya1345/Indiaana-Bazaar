import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card, Form, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { Icon } from '@iconify/react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const formatPrice = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const loading = loadedQuery !== query;

  useEffect(() => {
    const controller = new AbortController();
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/products${query ? `?q=${encodeURIComponent(query)}` : ''}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('Unable to load products.');
        const data = await res.json();
        const foundProducts = Array.isArray(data) ? data : [];
        setProducts(foundProducts);
        setSearchError('');

        if (query && foundProducts.length === 0) {
          try {
            const recommendationResponse = await fetch('/api/products', { signal: controller.signal });
            if (!recommendationResponse.ok) throw new Error('Unable to load product recommendations.');
            const allProducts = await recommendationResponse.json();
            const suggestedProducts = Array.isArray(allProducts) ? allProducts : [];
            setRecommendations(
              suggestedProducts
                .filter((product) => Number(product.stock) > 0)
                .sort((left, right) => (
                  Number(right.ratings || 0) - Number(left.ratings || 0)
                  || Number(right.numReviews || 0) - Number(left.numReviews || 0)
                ))
                .slice(0, 4)
            );
          } catch (error) {
            if (!controller.signal.aborted) {
              console.error('Unable to load product recommendations:', error);
              setRecommendations([]);
            }
          }
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setProducts([]);
          setRecommendations([]);
          setSearchError('We could not load products. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setLoadedQuery(query);
      }
    };
    fetchProducts();
    return () => controller.abort();
  }, [query]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [products]
  );
  const priceCeiling = products.reduce((highest, product) => Math.max(highest, Number(product.price) || 0), 0);
  const selectedMaxPrice = maxPriceFilter === null ? priceCeiling : Math.min(maxPriceFilter, priceCeiling);
  const filteredProducts = products
    .filter((product) => (
      (selectedCategories.length === 0 || selectedCategories.includes(product.category))
      && Number(product.price) <= selectedMaxPrice
    ))
    .sort((left, right) => {
      if (sortBy === 'price-asc') return Number(left.price) - Number(right.price);
      if (sortBy === 'price-desc') return Number(right.price) - Number(left.price);
      if (sortBy === 'name-asc') return left.name.localeCompare(right.name);
      if (sortBy === 'name-desc') return right.name.localeCompare(left.name);
      return 0;
    });

  const toggleCategory = (category) => {
    setSelectedCategories((current) => (
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category]
    ));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPriceFilter(null);
    setSortBy('default');
  };

  return (
    <Container>
      <motion.section
        aria-label="Shop banner"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="shop-hero rounded-4 p-4 p-md-5 mb-5 text-light"
      >
        <h1 className="display-5 fw-bold mb-2">Shop Indiana Bazaar</h1>
        <p className="lead mb-0">Discover products across all categories.</p>
      </motion.section>

      <section aria-label="Product catalog">
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : searchError ? (
        <div className="text-center py-5 text-danger" role="alert">
          <h5>Unable to load products</h5>
          <p className="mb-0">{searchError}</p>
        </div>
      ) : (
        <Row className="g-4">
          <Col lg={3}>
            <aside aria-label="Product filters">
              <Card className="shadow-sm border rounded-3">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <Icon icon="mdi:tune-variant" className="text-primary" aria-hidden="true" />
                    <h2 className="h5 mb-0">Filters &amp; Sort</h2>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Sort by</Form.Label>
                    <Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products">
                      <option value="default">Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold d-flex justify-content-between">
                      <span>Maximum price</span>
                      <span className="text-primary">{formatPrice(selectedMaxPrice)}</span>
                    </Form.Label>
                    <Form.Range
                      min="0"
                      max={priceCeiling}
                      step="1"
                      value={selectedMaxPrice}
                      onChange={(event) => setMaxPriceFilter(Number(event.target.value))}
                      disabled={priceCeiling === 0}
                      aria-label="Maximum product price"
                    />
                    <div className="d-flex justify-content-between text-secondary small">
                      <span>{formatPrice(0)}</span>
                      <span>{formatPrice(priceCeiling)}</span>
                    </div>
                  </Form.Group>

                  <fieldset className="mb-3">
                    <legend className="fw-semibold fs-6 mb-2">Categories</legend>
                    {categories.length > 0 ? categories.map((category, index) => (
                      <Form.Check
                        key={category}
                        id={`shop-category-${index}`}
                        type="checkbox"
                        label={category}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                    )) : (
                      <p className="text-secondary small mb-0">No categories available.</p>
                    )}
                  </fieldset>

                  <Button
                    variant="outline-secondary"
                    className="w-100 d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={clearFilters}
                  >
                    <Icon icon="mdi:filter-remove-outline" aria-hidden="true" />
                    Clear filters
                  </Button>
                </Card.Body>
              </Card>
            </aside>
          </Col>
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0">All Products</h2>
              <span className="text-secondary">{filteredProducts.length} products</span>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5 text-secondary border rounded-3 bg-white">
                <h5>
                  {products.length === 0
                    ? (query ? `No products found for “${query}”` : 'No products found')
                    : 'No products match these filters'}
                </h5>
                {query && products.length === 0 && <p>Try a different search or explore these picks.</p>}
                {products.length > 0 && (
                  <Button variant="link" onClick={clearFilters}>Clear filters</Button>
                )}
              </div>
            ) : (
              <Row className="g-4">
                {filteredProducts.map((product) => (
                  <Col key={product._id} xs={12} sm={6} xl={4}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            )}
            {products.length === 0 && recommendations.length > 0 && (
              <section className="mt-4" aria-label="Recommended products">
                <h3 className="h4 mb-3">You may also like</h3>
                <Row className="g-4">
                  {recommendations.map((product) => (
                    <Col key={product._id} xs={12} sm={6} xl={4}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </section>
            )}
          </Col>
        </Row>
      )}
      </section>
    </Container>
  );
};

export default Shop;
