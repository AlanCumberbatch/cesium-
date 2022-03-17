
#include <vector>
#include <iostream>

class LinearAprx{
	public:
		LinearAprx(){}

	  int getRequiredDataPoints(int degree, int inputOrder = 0){return 2;}

	  void interpolateOrderZero(
		        double x,
		        const std::vector<double> &xTable,
		        const std::vector<double> &yTable,
		        int yStride,
		        std::vector<double>& result
		) {

			//>>includeStart('debug',pragmas.debug);
				#ifdef DEBUG
					if(xTable.size() != 2){
					    std::cout<<std::endl << RED << "The xTable provide to the lineat interpolate must have exactly two elements" << RESET <<std::endl;
					} else if (yStride <= 0){
					    std::cout<<std::endl << RED << "There must be at least 1 dependent variable for each independent variable" << RESET <<std::endl;
					}
				#endif
			//>>includeEnd('debug');

			int i;
			double y0;
			double y1;
			double x0 = xTable[0];
			double x1 = xTable[1];

			//>>includeStart('debug',pragmas.debug);
				#ifdef DEBUG
					if(std::abs(x0-x1) <= WorldMath::EPSILON6){
					    std::cout<<std::endl << RED << "Divide by zero error: xTable[0] and xTable[1] are equal." << RESET <<std::endl;
					}
				#endif
			//>>includeEnd('debug');

			for(i = 0; i < yStride; i++){
			    y0 = yTable[i];
			    y1 = yTable[i + yStride];
				result.push_back( (((y1 - y0) * x) + (x1 * y0) - (x0 * y1)) / (x1 - x0) );

			}

		}
		~LinearAprx(){}
};




int main(){

 // 输入的到底是什么 -- 需要输入Cesium中算法执行前一致的数据啊
 // linear 使用的是 InterpolateOrderZero方法
	double x = -43.32800000072166;
    std::vector<double> xTable;
	xTable.push_back(-45.0);
	xTable.push_back(0.0);
    std::vector<double> yTable;
	yTable.push_back(-1938882.132435972);
	yTable.push_back(-4783104.970986614);
	yTable.push_back(3738309.9160818686);
	yTable.push_back(-1939387.900323652);
	yTable.push_back(-4781193.261036239);
	yTable.push_back(3740070.65716298);
    int yStride = 3;
    std::vector<double> result;
	
	LinearAprx Linear;
	Linear.interpolateOrderZero(
		x,
		xTable,
		yTable,
		yStride,
		result
	); 
	
	for (auto i :result)
		std::cout<<"result"<<i<<std::endl;

	return 0;
}
