// Eureka Instance Killer Content Script

(function() {
    'use strict';

    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }

    function initPlugin() {
        console.log('Eureka Instance Killer: 插件已加载');
        addDeleteButtons();
        
        // 监听页面变化，以防动态加载内容
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    setTimeout(addDeleteButtons, 100);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function addDeleteButtons() {
        // 查找所有实例链接
        const instanceLinks = findInstanceLinks();
        
        instanceLinks.forEach(link => {
            // 检查链接旁边是否已经有删除按钮
            let nextSibling = link.nextSibling;
            let hasDeleteButton = false;
            
            // 检查链接后面的元素是否已经有删除按钮
            while (nextSibling) {
                if (nextSibling.classList && nextSibling.classList.contains('eureka-delete-btn')) {
                    hasDeleteButton = true;
                    break;
                }
                nextSibling = nextSibling.nextSibling;
            }
            
            if (!hasDeleteButton) {
                const deleteBtn = createDeleteButton(link);
                if (deleteBtn) {
                    // 在链接后面添加删除按钮
                    link.insertAdjacentElement('afterend', deleteBtn);
                }
            }
        });
    }

    function findInstanceLinks() {
        const links = [];
        
        // 查找包含实例信息的链接
        // Eureka管理页面使用表格显示实例信息，实例通常在<a>标签中
        const instanceLinks = document.querySelectorAll('table#instances tbody tr td a');
        
        instanceLinks.forEach(link => {
            // 检查链接文本是否包含实例ID格式（通常包含冒号）
            if (link.textContent.includes(':')) {
                links.push(link);
            }
        });
        
        // 如果没有找到实例链接，尝试其他选择器
        if (links.length === 0) {
            // 尝试查找包含实例信息的表格行
            const instanceTables = document.querySelectorAll('table#instances');
            instanceTables.forEach(table => {
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length > 0) {
                        // 查找包含实例ID的单元格中的链接
                        cells.forEach(cell => {
                            if (cell.textContent.includes(':')) {
                                const cellLinks = cell.querySelectorAll('a');
                                cellLinks.forEach(link => {
                                    if (link.textContent.includes(':')) {
                                        links.push(link);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
        
        return links;
    }

    function createDeleteButton(instanceLink) {
        const instanceInfo = extractInstanceInfo(instanceLink);
        if (!instanceInfo) {
            return null;
        }

        const button = document.createElement('button');
        button.className = 'eureka-delete-btn';
        button.textContent = '删除';
        button.title = `删除实例: ${instanceInfo.instanceId}`;
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (confirm(`确定要删除实例 "${instanceInfo.instanceId}" 吗？`)) {
                deleteInstance(instanceInfo.application, instanceInfo.instanceId, button);
            }
        });
        
        return button;
    }

    function extractInstanceInfo(instanceLink) {
        // 尝试提取应用名和实例ID
        let application = '';
        let instanceId = '';
        
        // 从链接中提取实例ID
        instanceId = instanceLink.textContent.trim();
        
        // 查找应用名（通常在同一行的第一个单元格或表格标题中）
        if (instanceId) {
            // 获取包含链接的单元格
            const cell = instanceLink.closest('td');
            if (cell) {
                // 尝试从当前行查找应用名
                const row = cell.closest('tr');
                if (row) {
                    // 应用名通常在第一个单元格中
                    const firstCell = row.querySelector('td:first-child');
                    if (firstCell) {
                        application = firstCell.textContent.trim();
                    }
                    
                    // 如果第一个单元格没有应用名，尝试向上查找
                    if (!application) {
                        // 向上查找最近的应用名（通常在<b>标签中）
                        const appNameElement = row.querySelector('b');
                        if (appNameElement) {
                            application = appNameElement.textContent.trim();
                        }
                    }
                }
                
                // 如果在当前行没找到应用名，尝试从表格结构中查找
                if (!application) {
                    // 查找当前行所在的表格
                    const table = cell.closest('table');
                    if (table) {
                        // 遍历表格中的所有行，查找最近的应用名
                        const rows = table.querySelectorAll('tr');
                        let currentRowIndex = -1;
                        
                        // 找到当前行的索引
                        for (let i = 0; i < rows.length; i++) {
                            if (rows[i].contains(cell)) {
                                currentRowIndex = i;
                                break;
                            }
                        }
                        
                        // 从当前行向上查找应用名
                        if (currentRowIndex > 0) {
                            for (let i = currentRowIndex; i >= 0; i--) {
                                const row = rows[i];
                                const boldElements = row.querySelectorAll('b');
                                
                                for (const boldElement of boldElements) {
                                    const text = boldElement.textContent.trim();
                                    if (text && text !== 'n/a' && text !== 'UP' && text !== 'DOWN') {
                                        application = text;
                                        break;
                                    }
                                }
                                
                                if (application) break;
                            }
                        }
                    }
                }
            }
        }
        
        // 如果仍然没有找到应用名，但有实例ID，尝试从实例ID中提取
        if (!application && instanceId) {
            const parts = instanceId.split(':');
            if (parts.length > 1) {
                // 尝试从实例ID的第二部分提取应用名
                application = parts[1].toUpperCase();
            }
        }
        
        // 返回提取的信息
        if (application && instanceId) {
            return {
                application: application,
                instanceId: instanceId
            };
        }
        
        return null;
    }

    function deleteInstance(application, instanceId, button) {
        const url = `/eureka/apps/${application}/${instanceId}`;
        
        // 禁用按钮并显示加载状态
        button.disabled = true;
        button.textContent = '删除中...';
        
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log(`成功删除实例: ${instanceId}`);
                alert(`实例 "${instanceId}" 删除成功！`);
                
                // 移除对应的行或刷新页面
                const row = button.closest('tr') || button.closest('div');
                if (row) {
                    row.style.opacity = '0.5';
                    row.style.textDecoration = 'line-through';
                }
                
                // 3秒后刷新页面以更新状态
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                throw new Error(`删除失败: ${response.status} ${response.statusText}`);
            }
        })
        .catch(error => {
            console.error('删除实例时出错:', error);
            alert(`删除实例失败: ${error.message}`);
            
            // 恢复按钮状态
            button.disabled = false;
            button.textContent = '删除';
        });
    }
})();