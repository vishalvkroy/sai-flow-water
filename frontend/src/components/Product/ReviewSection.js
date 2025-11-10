import React, { useState } from 'react';
import styled from 'styled-components';
import { FiStar, FiThumbsUp, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ReviewContainer = styled.div`
  padding: 2rem 0;
`;

const ReviewStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OverallRating = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const RatingNumber = styled.div`
  font-size: 3.5rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
`;

const RatingStars = styled.div`
  font-size: 1.5rem;
  color: #fbbf24;
  margin-bottom: 0.5rem;
`;

const RatingCount = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const RatingBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RatingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
  font-size: 0.875rem;
  color: #4b5563;
`;

const RatingBar = styled.div`
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const RatingFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const RatingPercentage = styled.div`
  min-width: 45px;
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const WriteReviewButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const ReviewForm = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.2);
    color: #fbbf24;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.875rem;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #3b82f6;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ReviewerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
`;

const ReviewerDetails = styled.div``;

const ReviewerName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ReviewDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReviewRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fbbf24;
  font-size: 1.125rem;
`;

const ReviewText = styled.p`
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const HelpfulButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#dbeafe' : '#f3f4f6'};
  color: ${props => props.active ? '#1e40af' : '#6b7280'};
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #dbeafe;
    color: #1e40af;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const ReviewSection = ({ reviews = [], productId, onReviewAdded }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === star).length / totalReviews) * 100 : 0
  }));

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to write a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/products/${productId}/reviews`, {
        rating,
        comment: comment.trim()
      });

      toast.success('Review submitted successfully!');
      setShowForm(false);
      setRating(0);
      setComment('');
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        fill={i < count ? '#fbbf24' : 'none'}
        color={i < count ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ReviewContainer>
      {totalReviews > 0 && (
        <ReviewStats>
          <OverallRating>
            <RatingNumber>{averageRating}</RatingNumber>
            <RatingStars>{renderStars(Math.round(averageRating))}</RatingStars>
            <RatingCount>{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</RatingCount>
          </OverallRating>

          <RatingBreakdown>
            {ratingCounts.map(({ star, count, percentage }) => (
              <RatingRow key={star}>
                <RatingLabel>
                  {star} <FiStar size={14} />
                </RatingLabel>
                <RatingBar>
                  <RatingFill percentage={percentage} />
                </RatingBar>
                <RatingPercentage>{count}</RatingPercentage>
              </RatingRow>
            ))}
          </RatingBreakdown>
        </ReviewStats>
      )}

      {user && (
        <>
          {!showForm ? (
            <WriteReviewButton onClick={() => setShowForm(true)}>
              <FiStar /> Write a Review
            </WriteReviewButton>
          ) : (
            <ReviewForm onSubmit={handleSubmitReview}>
              <FormGroup>
                <Label>Your Rating</Label>
                <StarRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarButton
                      key={star}
                      type="button"
                      filled={star <= rating}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </StarButton>
                  ))}
                </StarRating>
              </FormGroup>

              <FormGroup>
                <Label>Your Review</Label>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </SubmitButton>
                <CancelButton
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setRating(0);
                    setComment('');
                  }}
                >
                  Cancel
                </CancelButton>
              </ButtonGroup>
            </ReviewForm>
          )}
        </>
      )}

      {totalReviews > 0 ? (
        <ReviewsList>
          {reviews.map((review) => (
            <ReviewCard key={review._id}>
              <ReviewHeader>
                <ReviewerInfo>
                  <ReviewerAvatar>
                    {review.user?.name?.[0]?.toUpperCase() || <FiUser />}
                  </ReviewerAvatar>
                  <ReviewerDetails>
                    <ReviewerName>{review.user?.name || 'Anonymous'}</ReviewerName>
                    <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                  </ReviewerDetails>
                </ReviewerInfo>
                <ReviewRating>{renderStars(review.rating)}</ReviewRating>
              </ReviewHeader>

              <ReviewText>{review.comment}</ReviewText>

              <ReviewActions>
                <HelpfulButton>
                  <FiThumbsUp size={16} />
                  Helpful ({review.helpful || 0})
                </HelpfulButton>
              </ReviewActions>
            </ReviewCard>
          ))}
        </ReviewsList>
      ) : (
        <EmptyState>
          <EmptyIcon>⭐</EmptyIcon>
          <EmptyTitle>No Reviews Yet</EmptyTitle>
          <EmptyText>
            Be the first to review this product and help others make informed decisions!
          </EmptyText>
          {user && !showForm && (
            <WriteReviewButton onClick={() => setShowForm(true)}>
              <FiStar /> Write the First Review
            </WriteReviewButton>
          )}
        </EmptyState>
      )}
    </ReviewContainer>
  );
};

export default ReviewSection;
