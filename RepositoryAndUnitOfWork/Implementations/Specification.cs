using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Linq.Expressions;
using RepositroryAndUnitOfWork.Helper;
using RepositroryAndUnitOfWork.Interfaces;

namespace RepositroryAndUnitOfWork.Implementations
{
    public class Specification<E> : ISpecification<E>
    {
        #region Private Members

        private Func<E, bool> _evalFunc = null;
        private Expression<Func<E, bool>> _evalPredicate;

        #endregion

        #region Virtual Accessors

        public virtual bool Matches(E entity)
        {
            return _evalPredicate.Compile().Invoke(entity);
        }

        public virtual Expression<Func<E, bool>> EvalPredicate
        {
            get { return _evalPredicate; }
        }

        public virtual Func<E, bool> EvalFunc
        {
            get { return _evalPredicate != null ? _evalPredicate.Compile() : null; }
        }

        #endregion

        #region Constructors

        public Specification(Expression<Func<E, bool>> predicate)
        {
            _evalPredicate = predicate;
        }

        private Specification() { }

        #endregion

        #region Private Nested Classes

        private class AndSpecification : Specification<E>
        {
            private readonly ISpecification<E> _left;
            private readonly ISpecification<E> _right;
            public AndSpecification(ISpecification<E> left, ISpecification<E> right)
            {
                this._left = left;
                this._right = right;

                this._evalFunc =
                    (Func<E, bool>)Delegate.Combine
                    (left.EvalPredicate.Compile(),
                    right.EvalPredicate.Compile());

                _evalPredicate = left.EvalPredicate.And(right.EvalPredicate);
            }
            public override bool Matches(E entity)
            {
                return EvalPredicate.Compile().Invoke(entity);
            }
        }

        private class OrSpecification : Specification<E>
        {
            private readonly ISpecification<E> _left;
            private readonly ISpecification<E> _right;
            public OrSpecification(ISpecification<E> left, ISpecification<E> right)
            {
                this._left = left;
                this._right = right;

                this._evalFunc =
                    (Func<E, bool>)Delegate.Combine
                    (left.EvalPredicate.Compile(),
                    right.EvalPredicate.Compile());

                _evalPredicate = left.EvalPredicate.Or(right.EvalPredicate);
            }
            public override bool Matches(E entity)
            {
                return EvalPredicate.Compile().Invoke(entity);
            }
        }

        #endregion

        #region Operator Overloads

        public static Specification<E> operator &(Specification<E> left, ISpecification<E> right)
        {
            return new AndSpecification(left, right);
        }

        public static Specification<E> operator |(Specification<E> left, ISpecification<E> right)
        {
            return new OrSpecification(left, right);
        }

        #endregion

    }
}
