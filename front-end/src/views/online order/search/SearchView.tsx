import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import axiosClient from '../../../api/axios';
import FilterSidebar from '../../../components/FilterSidebar';
import PageHeader from '../../../components/PageHeader';
import SelectBox from '../../../components/SelectBox';
import ProductSection from '../../../components/product/ProductSection';
import EmptyState from '../../../components/EmptyState';
import Pagination from '../../../components/Pagination';
import { type Product } from '../../../types';
import './SearchView.css';

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'rating', label: 'Đánh giá cao' },
];

const SearchView: React.FC = () => {
    const [searchParams] = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';
    const resultsRef = useRef<HTMLElement>(null);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<string>('newest');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [priceFilter, setPriceFilter] = useState<{ minPrice?: string; maxPrice?: string }>({});
    const [minRatingFilter, setMinRatingFilter] = useState<string>('');
    const [filterKey, setFilterKey] = useState<number>(0);
    const isFirstRender = useRef(true);

    useEffect(() => {
        setCurrentPage(1);
    }, [queryFromUrl, sortBy, priceFilter, minRatingFilter, typeFilter]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, [currentPage]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axiosClient.get('/dishes', {
                    params: {
                        q: queryFromUrl || undefined,
                        page: currentPage,
                        limit: ITEMS_PER_PAGE,
                        sortBy: sortBy,
                        type: typeFilter || undefined,
                        minPrice: priceFilter.minPrice || undefined,
                        maxPrice: priceFilter.maxPrice || undefined,
                        minRating: minRatingFilter || undefined,
                    },
                    signal: controller.signal,
                });

                const data = response.data;

                const rawDishes = Array.isArray(data)
                    ? data
                    : (data.data || data.dishes || data.products || data.items || []);

                const pagination = data.pagination || {};
                const totalCount =
                    pagination.totalRecords ??
                    data.totalItems ??
                    data.total ??
                    rawDishes.length;

                const calcTotalPages =
                    pagination.totalPages ??
                    data.totalPages ??
                    Math.ceil(totalCount / ITEMS_PER_PAGE);

                const mappedProducts: Product[] = rawDishes.map((item: any) => {
                    const mainImage = item.images?.find((img: any) => img.isMain);

                    return {
                        id: item.id.toString(),
                        name: item.name,
                        price: item.price,
                        rating: item.rating,
                        imageUrl:
                            mainImage?.imageUrl ??
                            item.images?.[0]?.imageUrl ??
                            "https://via.placeholder.com/300x200?text=No+Image",
                    };
                });

                setProducts(mappedProducts);
                setTotalItems(totalCount);
                setTotalPages(calcTotalPages || 1);
            } catch (err: any) {
                if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
                    return;
                }

                console.error('Lỗi khi tải danh sách sản phẩm:', err);
                setError('Đã có lỗi xảy ra khi tải danh sách sản phẩm. Vui lòng thử lại.');
                setProducts([]);
                setTotalItems(0);
                setTotalPages(1);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            controller.abort();
        };
    }, [queryFromUrl, currentPage, sortBy, priceFilter, minRatingFilter, typeFilter]);

    const handleApplyFilter = (filters: { minPrice: string; maxPrice: string; minRating: string; type: string }) => {
        setTypeFilter(filters.type || '');
        setPriceFilter({
            minPrice: filters.minPrice || undefined,
            maxPrice: filters.maxPrice || undefined,
        });
        setMinRatingFilter(filters.minRating || '');
    };

    const handleClearFilter = () => {
        setTypeFilter('');
        setPriceFilter({});
        setMinRatingFilter('');
        setFilterKey((prev) => prev + 1);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        resultsRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <div className="search-view-container">
            <PageHeader
                className="search-page-header"
                title={
                    queryFromUrl
                        ? `Kết quả tìm kiếm cho "${queryFromUrl}" (${totalItems})`
                        : `Tất cả sản phẩm (${totalItems})`
                }
            />

            <div className="search-view-layout">
                {/* Bộ lọc bên trái */}
                <FilterSidebar
                    key={filterKey}
                    onApplyFilter={handleApplyFilter}
                    onClearFilter={handleClearFilter}
                />

                {/* Nội dung chính bên phải */}
                <main ref={resultsRef} className="search-results-main">
                    <div className="search-toolbar">
                        <span className="results-count-info">
                            Hiển thị kết quả trang {currentPage} / {totalPages}
                        </span>
                        <div className="sort-wrapper">
                            <span className="sort-label">Sắp xếp theo:</span>
                            <SelectBox
                                options={SORT_OPTIONS}
                                value={sortBy}
                                onChange={handleSortChange}
                                className="sort-select-box"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="search-error-message" style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {products.length === 0 && !isLoading && !error ? (
                        <div className="search-empty-container">
                            <EmptyState
                                icon={
                                    <svg
                                        width="48"
                                        height="48"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        <line x1="8" y1="11" x2="14" y2="11" />
                                    </svg>
                                }
                                title="Không tìm thấy món ăn nào"
                                message={
                                    queryFromUrl
                                        ? `Không có kết quả nào phù hợp với "${queryFromUrl}" hoặc bộ lọc hiện tại.`
                                        : 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.'
                                }
                                actionText="Xóa điều kiện lọc"
                                onAction={handleClearFilter}
                            />
                        </div>
                    ) : (
                        <ProductSection
                            className="search-product-section"
                            products={products}
                            isLoading={isLoading}
                        />
                    )}

                    {totalPages > 1 && (
                        <div className="pagination-wrapper">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SearchView;