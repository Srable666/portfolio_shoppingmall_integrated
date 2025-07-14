// 테마 설정
const theme = {
    // 토큰 설정
    token: {
        colorPrimary: '#000000',
        colorLink: '#000000',
        colorLinkHover: '#333333',
        colorText: '#000000',
        colorBgBase: '#ffffff',
        borderRadius: 2,
        fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    // 컴포넌트 설정
    components: {
        Layout: {
            headerBg: '#000000',
        },
        Button: {
            colorPrimary: '#000000',
            algorithm: true,
        },
        Menu: {
            darkItemBg: '#000000',
            darkItemHoverBg: '#333333',
            darkItemSelectedBg: '#333333',
        }
    },
    // 스타일 설정
    styles: {
        cascader: {
            menuItemActive: {
                backgroundColor: '#e6f7ff',
                color: '#1890ff',
                fontWeight: 500,
            },
            menuItemHover: {
                backgroundColor: '#f5f5f5',
            }
        },
        select: {
            optionSelected: {
                backgroundColor: '#e6f7ff',
                color: '#1890ff',
                fontWeight: 500,
            },
            optionHover: {
                backgroundColor: '#f5f5f5',
            }
        },
        tableFilter: {
            itemSelected: {
                backgroundColor: '#e6f7ff',
                color: '#1890ff',
                fontWeight: 500,
            },
            itemHover: {
                backgroundColor: '#f5f5f5',
            }
        },
        clickableCell: {
            default: {
                color: 'inherit',
            },
            hover: {
                backgroundColor: '#e6f7ff',
                color: '#1890ff',
            },
            active: {
                backgroundColor: '#bae7ff',
            }
        },
        actionButton: {
            default: {
                color: '#1890ff',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#e6f7ff',
            },
            hover: {
                backgroundColor: '#bae7ff',
            }
        },
        datePicker: {
            selected: {
                backgroundColor: '#1890ff',
                color: '#fff',
            },
            hover: {
                backgroundColor: '#e6f7ff',
            },
            inRange: {
                backgroundColor: '#e6f7ff',
            },
            today: {
                borderColor: '#1890ff',
            },
        },
        timeline: {
            lastItem: {
                paddingBottom: 0,
            }
        }
    }
};

// 전역 스타일 적용
export const createGlobalStyles = () => `
    .ant-cascader-menu-item-active {
        background-color: ${theme.styles.cascader.menuItemActive.backgroundColor} !important;
        color: ${theme.styles.cascader.menuItemActive.color} !important;
        font-weight: ${theme.styles.cascader.menuItemActive.fontWeight} !important;
    }

    .ant-cascader-menu-item:hover {
        background-color: ${theme.styles.cascader.menuItemHover.backgroundColor} !important;
    }
        
    .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
        background-color: ${theme.styles.select.optionSelected.backgroundColor} !important;
        color: ${theme.styles.select.optionSelected.color} !important;
        font-weight: ${theme.styles.select.optionSelected.fontWeight} !important;
    }

    .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
        background-color: ${theme.styles.select.optionHover.backgroundColor} !important;
    }

    .ant-dropdown-menu-item-selected {
        background-color: ${theme.styles.tableFilter.itemSelected.backgroundColor} !important;
        color: ${theme.styles.tableFilter.itemSelected.color} !important;
        font-weight: ${theme.styles.tableFilter.itemSelected.fontWeight} !important;
    }

    .ant-dropdown-menu-item:hover {
        background-color: ${theme.styles.tableFilter.itemHover.backgroundColor} !important;
    }

    .ant-btn.clickable-cell {
        color: ${theme.styles.clickableCell.default.color};
        
        &:hover {
            background-color: ${theme.styles.clickableCell.hover.backgroundColor} !important;
            color: ${theme.styles.clickableCell.hover.color} !important;
            cursor: pointer;
        }
        
        &:active {
            background-color: ${theme.styles.clickableCell.active.backgroundColor};
        }
        
        &::before {
            display: none;
        }
    }
        
    .action-button {
        color: ${theme.styles.actionButton.default.color};
        font-size: ${theme.styles.actionButton.default.fontSize};
        padding: ${theme.styles.actionButton.default.padding};
        border-radius: ${theme.styles.actionButton.default.borderRadius};
        background-color: ${theme.styles.actionButton.default.backgroundColor};
        transition: all 0.3s;
        
        &:hover {
            background-color: ${theme.styles.actionButton.hover.backgroundColor};
            text-decoration: underline;
        }
    }
        
    .ant-picker-dropdown {
        .ant-picker-cell-in-view {
            &.ant-picker-cell-selected .ant-picker-cell-inner,
            &.ant-picker-cell-range-start .ant-picker-cell-inner,
            &.ant-picker-cell-range-end .ant-picker-cell-inner {
                background: ${theme.styles.datePicker.selected.backgroundColor} !important;
                color: ${theme.styles.datePicker.selected.color} !important;
            }
            
            &.ant-picker-cell-range-hover-start .ant-picker-cell-inner,
            &.ant-picker-cell-range-hover-end .ant-picker-cell-inner,
            &.ant-picker-cell-range-hover .ant-picker-cell-inner {
                background: ${theme.styles.datePicker.hover.backgroundColor} !important;
            }
            
            &.ant-picker-cell-in-range::before {
                background: ${theme.styles.datePicker.inRange.backgroundColor} !important;
            }
            
            &.ant-picker-cell-today .ant-picker-cell-inner::before {
                border-color: ${theme.styles.datePicker.today.borderColor} !important;
            }
            
            &.ant-picker-cell-in-range .ant-picker-cell-inner {
                background: ${theme.styles.datePicker.inRange.backgroundColor} !important;
            }
        }

        .ant-picker-time-panel {
            .ant-picker-time-panel-cell-selected {
                .ant-picker-time-panel-cell-inner {
                    background: ${theme.styles.datePicker.selected.backgroundColor} !important;
                    color: ${theme.styles.datePicker.selected.color} !important;
                }
            }
            
            .ant-picker-time-panel-column {
                .ant-picker-time-panel-cell-inner {
                    &:hover {
                        background: ${theme.styles.datePicker.hover.backgroundColor} !important;
                    }
                }
            }
        }
    }
        
    .ant-timeline {
        .ant-timeline-item:last-child {
            padding-bottom: ${theme.styles.timeline.lastItem.paddingBottom};
        }
    }
`;

export default theme;