import { createAuthedClient } from "@/lib/supabase/server";

/** ログインユーザーのお気に入りレシピ ID 一覧を取得 */
export const getFavoriteRecipeIds = async (): Promise<string[]> => {
  const { supabase, user } = await createAuthedClient();

  const { data, error } = await supabase
    .from("recipe_favorites")
    .select("recipe_id")
    .eq("user_id", user.id);

  if (error) throw error;
  return (data ?? []).map((row) => row.recipe_id);
};

/** お気に入りに追加 */
export const addFavorite = async (recipeId: string): Promise<void> => {
  const { supabase, user } = await createAuthedClient();

  const { error } = await supabase
    .from("recipe_favorites")
    .insert({ user_id: user.id, recipe_id: recipeId });

  if (error) throw error;
};

/** お気に入りから削除 */
export const removeFavorite = async (recipeId: string): Promise<void> => {
  const { supabase, user } = await createAuthedClient();

  const { error } = await supabase
    .from("recipe_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId);

  if (error) throw error;
};
