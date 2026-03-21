import { expect, test } from '@playwright/test';

test.describe('Auth Fallback Flows', () => {
    test('login page exposes provider CTAs', async ({ page }) => {
        await page.goto('/login?callbackUrl=/daily');

        await expect(page).toHaveTitle(/로그인|CosmicPath/i);
        await expect(page.getByRole('heading', { name: /로그인으로 흐름을 이어가세요/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /카카오로 계속하기/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Google로 계속하기/i })).toBeVisible();
    });

    test('auth error page renders readable guidance', async ({ page }) => {
        await page.goto('/auth/error?error=OAuthSignin&callbackUrl=/daily');

        await expect(page.getByRole('heading', { name: /로그인 흐름을 다시 연결합니다/i })).toBeVisible();
        await expect(page.getByText(/카카오 로그인 화면으로 이동하지 못했어요/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /카카오로 계속하기/i })).toBeVisible();
    });
});
