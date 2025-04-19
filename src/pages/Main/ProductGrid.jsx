import { Card, CardContent } from "@/components/ui/card";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";
import { Eye } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 날짜 계산 함수
const getDaysAgo = (dateString) => {
  if (!dateString) return "";
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - createdDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 이미지 URL 처리 함수
const getImageUrl = (imageUrls) => {
  if (!imageUrls) return "/placeholder.svg";

  try {
    // 콤마로 구분된 URL 문자열을 배열로 변환
    const urls = imageUrls.split(",").map((url) => url.trim());
    return urls[0] || "/placeholder.svg"; // 첫 번째 이미지 반환 또는 기본 이미지
  } catch (error) {
    return "/placeholder.svg";
  }
};

// 상태에 따른 스타일 설정
const statusConfig = {
  판매중: { label: "Đang bán", classname: "bg-green-100 text-green-800" },
  예약중: {
    label: "Đang đặt trước",
    classname: "bg-yellow-100 text-yellow-800",
  },
  판매완료: { label: "Đã bán", classname: "bg-red-100 text-red-800" },
};

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();

  // Supabase에서 상품 데이터 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Supabase에서 데이터 불러오기
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;

        setProducts(data || []);
        console.log("상품 데이터 로드 완료:", data?.length || 0);
      } catch (err) {
        console.error("상품 데이터 로딩 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 상품 클릭 핸들러
  const handleProductClick = (e, productId) => {
    if (!isLoggedIn) {
      e.preventDefault();
      // 현재 경로를 state로 전달하여 로그인 후 돌아올 수 있게 함
      navigate("/login", { state: { from: location.pathname } });
    }
    // 로그인되어 있으면 Link가 상품 상세 페이지로 이동
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-xl text-gray-500 font-medium">
          Đang tải sản phẩm...
        </div>
      </div>
    );
  }

  // 오류 발생 시 표시
  if (error) {
    return (
      <div className="w-full text-center py-12 text-red-500">
        <div className="text-xl font-medium">
          Đã xảy ra lỗi khi tải sản phẩm.
        </div>
        <p className="mt-2">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // 상품이 없는 경우 메시지 표시
  if (!products || products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <div className="text-xl text-gray-500 font-medium">
          Không có sản phẩm nào.
        </div>
        <p className="mt-2 text-gray-400">
          Sản phẩm mới sẽ được đăng trong thời gian sắp tới.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {products.map((product) => (
        <Link
          to={`/products/${product.id}`}
          key={product.id}
          onClick={(e) => handleProductClick(e, product.id)}
        >
          <Card className="card-hover">
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(product.image_urls)}
                alt={product.product_name}
                className="object-cover w-full h-full"
              />
              {product.status && product.status !== "판매중" && (
                <div
                  className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                    statusConfig[product.status]?.classname ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusConfig[product.status]?.label || product.status}
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800">
                {product.product_name}
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-base font-bold text-blue-600">
                  {product.price?.toLocaleString() || 0} VNĐ
                </p>
                <div className="flex items-center text-gray-500">
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  <span className="text-xs">{product.views || 0}</span>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {getDaysAgo(product.created_at)} ngày trước
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;
