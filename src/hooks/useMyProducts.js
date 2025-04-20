import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { getToken, getUserFromToken } from "@/utils/auth";

// Supabase 클라이언트 초기화 (일반 anon key 사용)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useMyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        // 로컬스토리지에서 토큰 가져오기
        const token = getToken();

        if (!token) {
          setError(new Error("Vui lòng đăng nhập để tiếp tục."));
          setLoading(false);
          return;
        }

        // 토큰에서 사용자 정보 추출
        const userData = getUserFromToken(token);

        if (!userData || !userData.id) {
          setError(new Error("Không thể lấy thông tin người dùng."));
          setLoading(false);
          return;
        }

        // 해당 사용자 ID로 상품 조회
        const { data, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setProducts(data || []);
        console.log("내 상품 데이터 로드 완료:", data?.length || 0);
      } catch (err) {
        console.error("상품 데이터 로딩 오류:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  // 상품 상태 변경 함수
  const updateProductStatus = async (productId, newStatus) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Cần xác thực để thực hiện thao tác này");
      }

      // 서버 API를 통해 상태 업데이트 (SERVICE_ROLE_KEY 사용)
      const response = await fetch("/api/update-product-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Thay đổi trạng thái thất bại");
      }

      console.log(`Supabase 업데이트 성공:`, result);

      // 상태 업데이트 후 상품 목록 갱신
      setProducts((prevProducts) => {
        const updatedProducts = prevProducts.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        );
        console.log("업데이트된 상품 목록:", updatedProducts);
        return updatedProducts;
      });

      return { success: true };
    } catch (err) {
      console.error("상품 상태 업데이트 오류:", err);
      return { success: false, error: err };
    }
  };

  // 상품 삭제 함수
  const deleteProduct = async (productId) => {
    try {
      console.log(`상품 ID ${productId} 삭제 시도...`);

      const token = getToken();
      if (!token) {
        console.error("토큰이 없어 삭제할 수 없습니다.");
        return {
          success: false,
          error: { message: "Cần đăng nhập để thực hiện thao tác này." },
        };
      }

      // 서버 API를 통해 삭제 요청 (SERVICE_ROLE_KEY 사용)
      const response = await fetch("/api/delete-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("서버 삭제 오류:", result);
        throw new Error(result.message || "Xóa sản phẩm thất bại");
      }

      console.log("서버 삭제 응답:", result);

      // 삭제 후 상품 목록 갱신
      setProducts((prevProducts) => {
        const filteredProducts = prevProducts.filter(
          (product) => product.id !== productId
        );
        console.log(`삭제 후 남은 상품 수: ${filteredProducts.length}`);
        return filteredProducts;
      });

      return { success: true, data: result.data };
    } catch (err) {
      console.error("상품 삭제 오류:", err);
      return { success: false, error: err };
    }
  };

  return {
    products,
    loading,
    error,
    updateProductStatus,
    deleteProduct,
  };
};
