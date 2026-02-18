
import React from 'react'

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    // Combine custom className with our base .skeleton class
    const skeletonClassName = className ? `skeleton ${className}` : 'skeleton'

    return (
        <div
            className={skeletonClassName}
            {...props}
        />
    )
}

export { Skeleton }
