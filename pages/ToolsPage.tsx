import React from 'react';

interface ToolsPageProps {
    isTabbed?: boolean;
}

const ToolsPage: React.FC<ToolsPageProps> = ({ isTabbed = false }) => {
    return (
        <div className="space-y-8">
            {!isTabbed && (
                <h2 className="text-2xl font-semibold accent-text">ხელსაწყოები</h2>
            )}
            {/* All tool components have been moved to and categorized directly within CommandPage.tsx */}
        </div>
    );
};

export default ToolsPage;