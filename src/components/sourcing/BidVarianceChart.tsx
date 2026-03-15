import React from 'react';
import styles from './BidVarianceChart.module.css';
import { Target, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface BidVarianceChartProps {
    budget: number;
    bids: { amount: number; vendorName: string }[];
    currency?: string;
}

const BidVarianceChart: React.FC<BidVarianceChartProps> = ({ budget, bids, currency = 'USD' }) => {
    if (!bids.length) return null;

    const amounts = bids.map(b => b.amount);
    const minBid = Math.min(...amounts);
    const maxBid = Math.max(...amounts);
    const avgBid = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Calculate percentage-based positions relative to budget
    // Scale: 0% to 150% of budget
    const getPos = (amount: number) => {
        const percentage = (amount / budget) * 100;
        return Math.min(Math.max(percentage, 0), 100); // Caps at 100% for the visual bar
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h4 className={styles.title}>Bid Distribution vs. Budget</h4>
                <div className={styles.budgetBadge}>
                    <Target size={14} />
                    <span>Budget: {formatCurrency(budget)}</span>
                </div>
            </div>

            <div className={styles.chartArea}>
                <div className={styles.track}>
                    {/* Budget Line */}
                    <div className={styles.budgetLine} />
                    
                    {/* Bids Range Bar */}
                    <div 
                        className={styles.rangeBar}
                        style={{
                            left: `${getPos(minBid)}%`,
                            width: `${getPos(maxBid) - getPos(minBid)}%`
                        }}
                    />

                    {/* Individual Bid Dots */}
                    {bids.map((bid, i) => (
                        <div 
                            key={i}
                            className={styles.bidDot}
                            style={{ left: `${getPos(bid.amount)}%` }}
                            title={`${bid.vendorName}: ${formatCurrency(bid.amount)}`}
                        />
                    ))}

                    {/* Indicators */}
                    <div className={styles.indicator} style={{ left: `${getPos(minBid)}%` }}>
                        <span className={styles.indicatorLabel}>Min</span>
                        <div className={styles.indicatorMarker} />
                    </div>

                    <div className={styles.indicator} style={{ left: `${getPos(maxBid)}%` }}>
                        <span className={styles.indicatorLabel}>Max</span>
                        <div className={styles.indicatorMarker} />
                    </div>

                    <div className={`${styles.indicator} ${styles.avgIndicator}`} style={{ left: `${getPos(avgBid)}%` }}>
                        <div className={styles.avgMarker} />
                        <span className={styles.indicatorLabel}>Avg</span>
                    </div>
                </div>

                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <div className={`${styles.swatch} ${styles.minSwatch}`} />
                        <span>Min: {formatCurrency(minBid)}</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.swatch} ${styles.avgSwatch}`} />
                        <span>Avg: {formatCurrency(avgBid)}</span>
                    </div>
                    <div className={styles.legendItem}>
                        <div className={`${styles.swatch} ${styles.maxSwatch}`} />
                        <span>Max: {formatCurrency(maxBid)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.stats}>
                {avgBid < budget ? (
                    <div className={styles.savingsAlert}>
                        <TrendingDown size={16} />
                        <span>Average bid is {( ((budget - avgBid) / budget) * 100 ).toFixed(1)}% below budget</span>
                    </div>
                ) : (
                    <div className={styles.overageAlert}>
                        <TrendingUp size={16} />
                        <span>Average bid is {( ((avgBid - budget) / budget) * 100 ).toFixed(1)}% above budget</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BidVarianceChart;
