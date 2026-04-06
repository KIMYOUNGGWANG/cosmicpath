import { expect, test } from '@playwright/test';

test.describe('Auth Fallback Flows', () => {
    test('login page exposes provider CTAs', async ({ page }) => {
        await page.goto('/login?callbackUrl=/daily');

        await expect(page).toHaveTitle(/로그인|Reconnect|CosmicPath/i);
        await expect(page.getByRole('heading', { name: /로그인으로 흐름을 이어가세요|Reconnect your reading path/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /카카오로 계속하기|Continue with Kakao/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Google로 계속하기|Continue with Google/i })).toBeVisible();
    });

    test('auth error page renders readable guidance', async ({ page }) => {
        await page.goto('/auth/error?error=OAuthSignin&callbackUrl=/daily');

        await expect(page.getByRole('heading', { name: /로그인 흐름을 다시 연결합니다|Reconnect the sign-in flow/i })).toBeVisible();
        await expect(page.getByText(/카카오 인증 중에 흐름이 끊겼습니다|Authentication was interrupted before we could return you to the same page/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /카카오로 계속하기|Continue with Kakao/i })).toBeVisible();
    });
});
