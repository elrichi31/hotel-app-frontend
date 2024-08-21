import { LoadingOutlined } from '@ant-design/icons';
import { Space, Spin } from 'antd';
const Loading = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Spin size="large" fullscreen/>
        </div>
    );
    
}

export default Loading