#include <cmath>
#include <math.h>
#include <vector>
#include <iostream>

int factorial(int n){
	return (n == 1 || n == 0) ? 1 : factorial(n - 1) * n;
}

class HermiteAprx{
	public:
		HermiteAprx(){}

		int getRequiredDataPoints(int degree, int inputOrder = 0) {
			return std::max((int) std::floor((degree + 1) / (inputOrder + 1)), 2);
		}

		void interpolateOrderZero(
      double x,
      const std::vector<double> &xTable,
      const std::vector<double> &yTable,
      int yStride,
      std::vector<double>& result
		){
			int i;
			int j;
			int d;
			int s;
			int len;
			unsigned index;
			int length = xTable.size();
			std::vector< std::vector<std::vector<double> > > coefficients(yStride, std::vector<std::vector<double> >(length)); // 这一步，用来定义一个三维数组， ,std::vector<double>(length,0)

      for(i = 0; i < yStride; i++){
				result.push_back(0);
			}

			int zIndicesLength = length;
			std::vector<int> zIndices(zIndicesLength);

			for(i = 0;i < zIndicesLength; i++){
				zIndices[i] = i;
			}

			int highestNonZeroCofe = length - 1;

			for(s = 0; s < yStride; s++ ){

				for(j = 0; j < zIndicesLength; j++){
				    index = zIndices[j] * yStride + s;
				    coefficients[s][0].push_back(yTable[index]);
				}

				for(i = 1; i < zIndicesLength; i++){

				    bool nonZeroCoefficients = false;

				    for(j = 0; j < zIndicesLength - i; j++){
				        double zj = xTable[zIndices[j]];
				        double zn = xTable[zIndices[j+i]];

				        double numerator;

				        if(zn - zj <= 0){
				            index = zIndices[j] * yStride + yStride * i + s;
				            numerator = yTable[index];
				            coefficients[s][i].push_back(numerator / factorial(i) ); //  (zn - zj) 這裏不一樣！！！
				        } else {
                  numerator = coefficients[s][i - 1][j + 1] - coefficients[s][i - 1][j];
                  coefficients[s][i].push_back(numerator / (zn - zj) );
                }

				        nonZeroCoefficients = nonZeroCoefficients || 0.000001 < std::abs(numerator);
				    }

				    if(!nonZeroCoefficients){
				        highestNonZeroCofe = i - 1;
				    }
				}

			}
			for(d = 0, len = 0; d <= len; d++){
				for(i = d; i <= highestNonZeroCofe; i++){
				    std::vector<double> t;
				    double tempTerm = calculateCoefficientTerm(x,zIndices,xTable,d,i,t);

				    for(s = 0; s < yStride; s++){
				        double coeff = coefficients[s][i][0];// ？ coefficients[s][i] 怎麼就沒有呢？？？
				        result[s + d * yStride] += coeff * tempTerm;
				    }
				}
			}
		};

		static double calculateCoefficientTerm(
      double x,
      const std::vector<int> &zIndices,
      const std::vector<double> &xTable,
      int derivOrder,
      int termOrder,
      std::vector<double>& reservedIndices
		){
      double result = 0;
      bool reserved;
      int i;
      unsigned int j;

      if(derivOrder > 0){// 这里没走
        std::cout<<"555000000000"<<std::endl;
        for(i = 0; i < termOrder; i++){
          reserved = false;
          for(j = 0; j < reservedIndices.size() && !reserved; j++){
            if(i == reservedIndices[j]){
              reserved = true;
            }
          }

          if(!reserved){
            reservedIndices.push_back(i);
            result += calculateCoefficientTerm(
              x,
              zIndices,
              xTable,
              derivOrder - 1,
              termOrder,
              reservedIndices
            );
            reservedIndices.erase(reservedIndices.end() - 1);
          }
        }
        return result;
      }

      result = 1;
      for(i = 0; i < termOrder; i++){
        reserved = false;

        for(j = 0; (j < reservedIndices.size() && !reserved); j++){
          if(i == reservedIndices[j]){
            reserved = true;
          }
        }

        if(!reserved){
          result *= x - xTable[zIndices[i]];
        }
      }

      return result;
    };

    void Interpolate(
        double x,
        const std::vector<double> &xTable,
        const std::vector<double> &yTable,
        int yStride,
        int inputOrder,
        int outputOrder,
        std::vector<double>& result
    ){
					int resultLength = yStride * (outputOrder + 1);

					for(int r = 0; r < resultLength; r++){
						// result[r] = 0;
						result.push_back(0);
					}

					int length = xTable.size();
					std::vector<int> zIndices(length * (inputOrder + 1));
					for(int i = 0; i < length; i++){
						for(int j = 0; j < (inputOrder + 1); j++){
							zIndices[i * (inputOrder + 1) + j] = i;
						}
					}

					int zIndiceslength = zIndices.size();
					std::vector<double> coefficients(32);
					int highestNonZeroCoef = fillCoefficientList( coefficients, zIndices, xTable, yTable, yStride, inputOrder);
					std::vector<double> reservedIndices;

					int tmp = zIndiceslength * (zIndiceslength + 1) / 2;
					int loopStop = std::min(highestNonZeroCoef,outputOrder);
					for(int d = 0; d <= loopStop; d++){
						for(int i = 0; i <= highestNonZeroCoef; i++){
							reservedIndices.clear();
							double tempTerm = calculateCoefficientTerm(x, zIndices,xTable,d,i,reservedIndices);
							int dimTwo = std::floor(i * (1 - i) / 2) + (zIndiceslength * i);

							for(int s = 0; s < yStride; s++){
								int dimOne = std::floor(s * tmp);
								double coef = coefficients[dimOne + dimTwo];
								result[s + d * yStride] += coef * tempTerm;
							}
						}
					}
    }

		static int fillCoefficientList(
		        std::vector<double> &coefficients,
		        std::vector<int> &zIndices,
		        const std::vector<double> &xTable,
		        const std::vector<double> &yTable,
		        int yStride,
		        int inputOrder
		){
			int j;
			int index;
			int highestNonZero = -1;
			int zIndiceslength = zIndices.size();
			int tmp = zIndiceslength * (zIndiceslength + 1) / 2;

			for(int s = 0; s < yStride; s++){
				int dimOne = std::floor(s * tmp);

				for(j = 0; j < zIndiceslength; j++){
					index = zIndices[j] * yStride * (inputOrder + 1) + s;
					coefficients[dimOne + j] = yTable[index];
				}

				for(int i = 1; i < zIndiceslength; i++){
					int coefIndex = 0;
					int dimTwo = std::floor(i * (1 - i) / 2) + (zIndiceslength * i);
					bool nonZeroCoefficients = false;

					for(j = 0; j < zIndiceslength - i; j++){
					    double zj = xTable[zIndices[j]];
					    double zn = xTable[zIndices[j+1]];

					    double numerator;
					    double coefficient;
					    if(zn - zj <= 0){
					        index = zIndices[j] * yStride * (inputOrder + 1) + yStride * i + s;
					        numerator = yTable[index];
					        coefficient = (numerator / factorial(i));
					        coefficients[dimOne + dimTwo + coefIndex] = coefficient;
					        coefIndex++;
					    } else {
					        int dimTwoMinusOne = std::floor( (i - 1) * (2 - i) / 2) + (zIndiceslength * (i - 1));
					        numerator = coefficients[dimOne + dimTwoMinusOne + j + 1] - coefficients[dimOne + dimTwoMinusOne + j];
					        coefficient = (numerator / (zn - zj));
					        coefficients[dimOne + dimTwo + coefIndex] = coefficient;
					        coefIndex++;
					    }

					    nonZeroCoefficients = nonZeroCoefficients || 0.000001 < std::abs(numerator);
					}

					if(nonZeroCoefficients){
					    highestNonZero = std::max(highestNonZero, (int) i);
					}
				}
			}
			return highestNonZero;
		};

		~HermiteAprx(){}
};

int main(){

	double x = -84.62299999952666;

  std::vector<double> xTable;
	xTable.push_back(-90.0);
	xTable.push_back(-45.0);
	xTable.push_back(-0.0);

  std::vector<double> yTable;
	yTable.push_back(-1938882.132435972);
	yTable.push_back(-4783104.970986614);
	yTable.push_back(3738309.9160818686);
	yTable.push_back(-1939387.900323652);
	yTable.push_back(-4781193.261036239);
	yTable.push_back(3740070.65716298);
	yTable.push_back(-1941923.3612027455);
	yTable.push_back(-4779821.267164548);
	yTable.push_back(3741046.3285450945);

  int yStride = 3;
  std::vector<double> result;

  HermiteAprx Hermite;
	Hermite.interpolateOrderZero(
		x,
		xTable,
		yTable,
		yStride,
		result
	);

	for (auto& index : result)
		std::cout<<"result  "<<index<<std::endl;

	return 0;

}
