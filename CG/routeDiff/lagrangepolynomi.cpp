#include <vector>
#include <iostream>

class LagrangeAprx{
	public:
		LagrangeAprx(){}

		int getRequiredDataPoints(int degree, int inputOrder = 0){ return std::max(degree + 1, 2); }

		void interpolateOrderZero(
		        double x,
		        const std::vector<double> &xTable,
		        const std::vector<double> &yTable,
		        int yStride,
		        std::vector<double>& result
		) {
			int i;
			int j;
			int length = xTable.size();

			for(i = 0; i < yStride; i++){
				result.push_back(0);
			}

			for(i = 0; i < length; i++){
				double coefficient = 1;

				for(j = 0; j < length; j++){
				    if(j != i){
				        double diffX = xTable[i] - xTable[j];
				        coefficient *= (x - xTable[j]) / diffX;
				    }
				}

				for(j = 0;  j < yStride; j++){
				    result[j] += coefficient * yTable[i * yStride + j];
				}
			}
		}

		~LagrangeAprx(){}
};

int main(){

	double x = -67.72600000043167;

  std::vector<double> xTable;
	xTable.push_back(-225.0);
	xTable.push_back(-180.0);
	xTable.push_back(-135.0);
	xTable.push_back(-90.0);
	xTable.push_back(-45.0);
	xTable.push_back(-0.0);

  std::vector<double> yTable;
	yTable.push_back(-1944814.3726146347);
	yTable.push_back(-4779323.961685797);
	yTable.push_back(3740297.3814439983);
	yTable.push_back(-1946353.4244015086);
	yTable.push_back(-4779956.238836014);
	yTable.push_back(3738233.3529754514);
	yTable.push_back(-1945750.717271222);
	yTable.push_back(-4781652.001063456);
	yTable.push_back(3736280.714354399);
	yTable.push_back(-1943370.2943612777);
	yTable.push_back(-4783382.7269118745);
	yTable.push_back(3735607.1109777773);
	yTable.push_back(-1940506.515172479);
	yTable.push_back(-4783950.993914748);
	yTable.push_back(3736412.6206093826);
	yTable.push_back(-1938934.0602408552);
	yTable.push_back(-4783233.073741037);
	yTable.push_back(3738410.7113252394);

    int yStride = 3;
    std::vector<double> result;

	LagrangeAprx Lagrange;
	Lagrange.interpolateOrderZero(
		x,
		xTable,
		yTable,
		yStride,
		result
	);

	for (auto& index : result)
		std::cout<<"result"<<index<<std::endl;

	return 0;
}
