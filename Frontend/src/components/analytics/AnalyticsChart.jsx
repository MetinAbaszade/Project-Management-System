import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import Card from '../ui/Card';
import { useTheme } from '../../theme/ThemeProvider';

const AnalyticsChart = ({
  type = 'line',
  data,
  title,
  subtitle,
  height = 300,
  dataKeys = [],
  colors = [],
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  className = '',
  filters = null,
  loading = false,
}) => {
  const { theme } = useTheme();
  
  // Default colors if none provided
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const chartColors = colors.length > 0 ? colors : defaultColors;
  
  // Determine chart grid, text, tooltip colors based on theme
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = theme === 'dark' ? '#e5e7eb' : '#374151';
  const tooltipBg = theme === 'dark' ? '#1f2937' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#e5e7eb';
  
  if (loading) {
    return (
      <Card className={className}>
        <Card.Header>
          <div className="animate-pulse">
            <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
            {subtitle && <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>}
          </div>
          {filters && <div className="w-24 h-8 bg-neutral-200 dark:bg-neutral-700 rounded"></div>}
        </Card.Header>
        <Card.Body>
          <div className="h-[300px] bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
        </Card.Body>
      </Card>
    );
  }
  
  // Customize tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Render appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis dataKey="name" stroke={textColor} />
              <YAxis stroke={textColor} />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={chartColors[index % chartColors.length]} 
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'horizontal-bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart 
              layout="vertical" 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis type="number" stroke={textColor} />
              <YAxis type="category" dataKey="name" stroke={textColor} width={120} />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={chartColors[index % chartColors.length]} 
                  radius={[0, 4, 4, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis dataKey="name" stroke={textColor} />
              <YAxis stroke={textColor} />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  stroke={chartColors[index % chartColors.length]} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />}
              <XAxis dataKey="name" stroke={textColor} />
              <YAxis stroke={textColor} />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area 
                  key={key} 
                  type="monotone" 
                  dataKey={key} 
                  fill={chartColors[index % chartColors.length]} 
                  stroke={chartColors[index % chartColors.length]}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={30}
                dataKey={dataKeys[0]}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={60}
                dataKey={dataKeys[0]}
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return <div>Unsupported chart type</div>;
    }
  };
  
  return (
    <Card className={className}>
      {(title || filters) && (
        <Card.Header className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            {subtitle && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
          </div>
          {filters && filters}
        </Card.Header>
      )}
      <Card.Body className={!title && !filters ? 'pt-4' : ''}>
        {renderChart()}
      </Card.Body>
    </Card>
  );
};

AnalyticsChart.propTypes = {
  type: PropTypes.oneOf(['bar', 'horizontal-bar', 'line', 'area', 'pie', 'donut']),
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  height: PropTypes.number,
  dataKeys: PropTypes.array.isRequired,
  colors: PropTypes.array,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showGrid: PropTypes.bool,
  className: PropTypes.string,
  filters: PropTypes.node,
  loading: PropTypes.bool,
};

export default AnalyticsChart;