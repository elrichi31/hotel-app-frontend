import { LoadingOutlined } from '@ant-design/icons';
import { Space, Spin } from 'antd';
const Loading = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 bg-opacity-50">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        </div>
    );
    
}

export default Loading