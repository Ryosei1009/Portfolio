import React, { useEffect, useRef, useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/solid'

// メールアドレスは、押すまで画面に出さない（ページの HTML からアドレスを自動で集めるスパムを避ける）
// 押すと、その場でアドレスとメールを書くリンクに切り替わる
// className: 「表示する」ボタンとリンクの両方に付ける見た目
const EmailReveal = ({ mail, className = '', iconClassName = 'h-5 w-5' }) => {
    const [revealed, setRevealed] = useState(false)
    const linkRef = useRef(null)

    // 表示したら、キーボードで操作している人のためにリンクへフォーカスを移す
    useEffect(() => {
        if (revealed) linkRef.current?.focus()
    }, [revealed])

    if (!mail) return null

    if (!revealed) {
        return (
            <button type="button" onClick={() => setRevealed(true)} className={`${className} underline decoration-dotted underline-offset-4`}>
                <EnvelopeIcon className={`${iconClassName} shrink-0`} aria-hidden="true" />
                メールアドレスを表示
            </button>
        )
    }
    return (
        <a ref={linkRef} href={`mailto:${mail}`} className={className}>
            <EnvelopeIcon className={`${iconClassName} shrink-0`} aria-hidden="true" />
            {mail}
        </a>
    )
}

export default EmailReveal
