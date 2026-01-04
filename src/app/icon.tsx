import { ImageResponse } from 'next/og'

export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                }}
            >
                <div
                    style={{
                        background: '#0a0a0c', // Darker background for better contrast
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #D4AF37',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* North Star at top */}
                        <path
                            d="M16 4L17.5 9L22.5 10.5L17.5 12L16 17L14.5 12L9.5 10.5L14.5 9L16 4Z"
                            fill="#D4AF37"
                        />

                        {/* Horizon Arc */}
                        <path
                            d="M4 22C8 18 24 18 28 22"
                            stroke="#D4AF37"
                            strokeWidth="1"
                            strokeLinecap="round"
                            opacity="0.6"
                        />

                        {/* Path/Arrow coming from bottom */}
                        <path
                            d="M16 30V18L13 22M16 18L19 22"
                            stroke="#D4AF37"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
