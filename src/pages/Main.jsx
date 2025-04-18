import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { getUserFromToken } from "@/utils/auth";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Main = () => {
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = searchParams.toString(); // URL에서 토큰 가져오기
        if (!token) {
          throw new Error("토큰이 없습니다.");
        }

        // 토큰에서 사용자 정보 추출
        const tokenData = getUserFromToken(token);
        if (!tokenData || !tokenData.id) {
          throw new Error("유효하지 않은 토큰입니다.");
        }

        // 토큰에서 추출한 ID로 사용자 정보 조회
        const { data: user, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", tokenData.id)
          .single();

        if (userError) throw userError;
        if (!user) throw new Error("사용자를 찾을 수 없습니다.");

        setUserData(user);
      } catch (err) {
        console.error("사용자 정보 조회 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [searchParams]);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">메인 페이지</h1>
      <p className="text-lg text-gray-600">
        환영합니다! 로그인하거나 회원가입을 진행해주세요.
      </p>
      {userData && (
        <div className="space-y-2">
          <p className="text-lg">사용자 ID: {userData.id}</p>
          <p className="text-lg">이메일: {userData.email}</p>
          <p className="text-lg">닉네임: {userData.nickname}</p>
        </div>
      )}
    </div>
  );
};

export default Main;
