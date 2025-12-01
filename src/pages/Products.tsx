import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
import { useElasticProducts } from "@/hooks/useElasticProducts";
import { ElasticProduct, ProductFilters as ProductFiltersType } from "@/types/products";

const Products = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [selectedProduct, setSelectedProduct] = useState<ElasticProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useElasticProducts({
    page,
    pageSize: 20,
    filters,
  });

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleViewDetails = (product: ElasticProduct) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">Produtos Agrícolas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {data?.total ? (
                  <>Base de dados com <span className="font-semibold">{data.total.toLocaleString('pt-BR')}</span> produtos registrados</>
                ) : (
                  'Carregando produtos...'
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />

          <ProductsTable
            products={data?.products || []}
            isLoading={isLoading}
            currentPage={page}
            totalPages={data?.totalPages || 1}
            onPageChange={setPage}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Products;
