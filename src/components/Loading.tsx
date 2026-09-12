import { Spinner } from '@heroui/react';
const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-background/60">
            <Spinner size="lg" />
        </div>
    );

}

export default Loading