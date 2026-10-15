import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

// 画面全体の保存状態（編集モードのバーで使う）
const entries = new Map()
const listeners = new Set()
const notify = () => listeners.forEach((listener) => listener())
const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}
const summarize = () => {
    const statuses = [...entries.values()].map((entry) => entry.status)
    return ['error', 'saving', 'pending', 'saved'].find((status) => statuses.includes(status)) ?? 'idle'
}

// 一番気にすべき状態を返す（失敗 → 保存中 → 未保存 → 保存済み の順）
export const useSaveSummary = () => useSyncExternalStore(subscribe, summarize)

// 待っている分をすべてすぐ保存する（ログアウトの前など）
export const flushAll = () => Promise.all([...entries.values()].map((entry) => entry.flush()))

// 保存できていない変更が残っているか
export const hasUnsavedChanges = () => [...entries.values()].some((entry) => entry.isDirty())

// 管理者画面の自動保存
// - 表示しただけでは保存しない（最初の値を「保存済み」とみなす）
// - 入力が止まってから delay ミリ秒後に保存する
// - 保存中に入力があれば、終わってからもう一度保存する
// - status: 'idle' | 'pending'（未保存） | 'saving' | 'saved' | 'error'
export const useAutoSave = (data, save, { delay = 1000 } = {}) => {
    const [status, setStatus] = useState('idle')
    const latest = useRef(data)
    const lastSaved = useRef(JSON.stringify(data))
    const saveRef = useRef(save)
    const timer = useRef(null)
    const saving = useRef(false)
    // reset するたびに増やし、切り替え前に始まった保存の結果を無視する
    const generation = useRef(0)

    latest.current = data
    saveRef.current = save

    const flush = useCallback(async () => {
        clearTimeout(timer.current)
        if (saving.current) return
        const snapshot = latest.current
        const json = JSON.stringify(snapshot)
        if (json === lastSaved.current) return

        const startedGeneration = generation.current
        saving.current = true
        setStatus('saving')
        let failed = false
        try {
            await saveRef.current(snapshot)
            if (startedGeneration === generation.current) lastSaved.current = json
        } catch (error) {
            console.error('保存に失敗しました:', error)
            failed = startedGeneration === generation.current
        } finally {
            saving.current = false
        }

        if (failed) {
            setStatus('error')
        } else if (JSON.stringify(latest.current) !== lastSaved.current) {
            // 保存中に入力された分（または切り替え後の作品の変更）を続けて保存する
            setStatus('pending')
            timer.current = setTimeout(flush, delay)
        } else {
            setStatus(startedGeneration === generation.current ? 'saved' : 'idle')
        }
    }, [delay])

    // 別の作品に切り替えたときなど、今の値を「保存済み」として扱い直す
    const reset = useCallback((next) => {
        clearTimeout(timer.current)
        generation.current += 1
        lastSaved.current = JSON.stringify(next)
        setStatus('idle')
    }, [])

    useEffect(() => {
        if (JSON.stringify(data) === lastSaved.current) {
            // 編集してから保存済みの内容に戻した場合は、保存しない
            clearTimeout(timer.current)
            if (!saving.current) setStatus((prev) => (prev === 'pending' ? 'idle' : prev))
            return
        }
        setStatus('pending')
        clearTimeout(timer.current)
        timer.current = setTimeout(flush, delay)
    }, [data, delay, flush])

    // 画面を閉じるときは、待っている分をすぐ保存する
    useEffect(() => () => {
        if (JSON.stringify(latest.current) !== lastSaved.current) flush()
    }, [flush])

    // 画面全体の保存状態に登録する
    const key = useId()
    useEffect(() => {
        entries.set(key, { status, flush, isDirty: () => JSON.stringify(latest.current) !== lastSaved.current })
        notify()
    }, [key, status, flush])
    useEffect(() => () => {
        entries.delete(key)
        notify()
    }, [key])

    // 未保存のままページを離れようとしたら確認する
    useEffect(() => {
        if (status !== 'pending' && status !== 'saving' && status !== 'error') return
        const handleBeforeUnload = (event) => {
            event.preventDefault()
            event.returnValue = ''
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [status])

    return { status, flush, reset }
}
