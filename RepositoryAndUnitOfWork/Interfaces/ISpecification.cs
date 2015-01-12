using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Linq.Expressions;

namespace RepositroryAndUnitOfWork.Interfaces
{
    public interface ISpecification<E>
    {
        /// <summary>
        /// Select/Where Expression
        /// </summary>
        Expression<Func<E, bool>> EvalPredicate { get; }
        /// <summary>
        /// Function to evaluate where Expression
        /// </summary>
        Func<E, bool> EvalFunc { get; }
    }
}
