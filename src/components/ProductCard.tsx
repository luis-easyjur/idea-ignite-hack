import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink, Sprout } from "lucide-react";
import { CompetitorProduct } from "@/types/product";

interface ProductCardProps {
  product: CompetitorProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      "Bioestimulante": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      "Fertilizante": "bg-green-500/10 text-green-700 dark:text-green-300",
      "Defensivo": "bg-red-500/10 text-red-700 dark:text-red-300",
      "Adjuvante": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    };
    return colors[category || ""] || "bg-muted text-muted-foreground";
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      "Ativo": "bg-green-500/10 text-green-700 dark:text-green-300",
      "Em registro": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      "Descontinuado": "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    };
    return colors[status || ""] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
            {product.competitor_name && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <Building2 className="h-3 w-3" />
                {product.competitor_name}
              </CardDescription>
            )}
          </div>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 object-cover rounded-md"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {product.category && (
            <Badge variant="outline" className={getCategoryColor(product.category)}>
              {product.category}
            </Badge>
          )}
          {product.status && (
            <Badge variant="outline" className={getStatusColor(product.status)}>
              {product.status}
            </Badge>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {product.active_ingredient && (
          <div className="text-sm">
            <span className="font-medium">Ingrediente Ativo:</span>
            <span className="text-muted-foreground ml-1">{product.active_ingredient}</span>
          </div>
        )}

        {product.registration_number && (
          <div className="text-sm">
            <span className="font-medium">Registro:</span>
            <span className="text-muted-foreground ml-1">{product.registration_number}</span>
          </div>
        )}

        {product.target_crops && product.target_crops.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <Sprout className="h-3 w-3 text-muted-foreground" />
            {product.target_crops.slice(0, 3).map((crop, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {crop}
              </Badge>
            ))}
            {product.target_crops.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{product.target_crops.length - 3}
              </span>
            )}
          </div>
        )}

        {product.source_url && (
          <a
            href={product.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Ver fonte
          </a>
        )}
      </CardContent>
    </Card>
  );
};
