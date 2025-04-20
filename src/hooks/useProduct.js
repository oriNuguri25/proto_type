import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useProduct = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        // Supabase에서 데이터 불러오기
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;

        // 조회수 증가 (실제 구현시 필요)
        if (data) {
          const views = (data.views || 0) + 1;
          // 조회수 업데이트는 에러 처리를 따로하여 데이터 표시에 영향 없게 함
          supabase
            .from("products")
            .update({ views })
            .eq("id", productId)
            .then(() => console.log("조회수 업데이트됨"))
            .catch((err) => console.error("조회수 업데이트 실패:", err));

          // 업데이트된 조회수 반영
          setProduct({ ...data, views });
        } else {
          setProduct(null);
          setError(new Error("상품을 찾을 수 없습니다."));
        }
      } catch (err) {
        console.error("상품 데이터 로딩 오류:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};
