import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
    return (
        <div style={{ maxWidth: '1600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <Skeleton style={{ height: '40px', width: '250px', marginBottom: '0.5rem' }} />
                    <Skeleton style={{ height: '24px', width: '400px' }} />
                </div>
                <Skeleton style={{ height: '40px', width: '150px', borderRadius: '9999px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} style={{ height: '128px', borderRadius: '1rem' }} />
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <Skeleton style={{ height: '400px', borderRadius: '1rem' }} />
                <Skeleton style={{ height: '400px', borderRadius: '1rem' }} />
                <Skeleton style={{ height: '400px', borderRadius: '1rem' }} />
            </div>
        </div>
    )
}
